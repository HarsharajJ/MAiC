import re
import numpy as np
import requests
from langchain_core.tools import tool
from langchain_ollama.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
import os
from langchain_groq import ChatGroq

# Set Groq API key
from dotenv import load_dotenv



load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
# Set Groq API key
os.environ["GROQ_API_KEY"] = api_key
# Define path for storing ChromaDB
CHROMA_PERSIST_DIRECTORY = "chroma_store1"
COLLECTION_NAME = "mtl_documents"

# Keep your original VectorStoreRetriever as a wrapper for ChromaDB
class VectorStoreRetriever:
    def __init__(self, chroma_db):
        self._chroma_db = chroma_db
    
    @classmethod
    def from_docs(cls, docs):
        # Initialize embedding model
        embed_model = OllamaEmbeddings(model="nomic-embed-text")
        
        # Create a new ChromaDB instance
        db = Chroma.from_documents(
            documents=docs,
            embedding=embed_model,
            collection_name=COLLECTION_NAME,
            persist_directory=CHROMA_PERSIST_DIRECTORY
        )
        
        # Persist to disk
        db.persist()
        print(f"Created and saved vector store to {CHROMA_PERSIST_DIRECTORY}")
        
        return cls(db)
    
    def query(self, query: str, k: int = 5) -> list[dict]:
        # Query ChromaDB and format results to match your original format
        results = self._chroma_db.similarity_search_with_relevance_scores(query, k=k)
        
        return [
            {
                "page_content": doc.page_content,
                "metadata": doc.metadata,
                "similarity": score
            }
            for doc, score in results
        ]

def create_new_retriever(urls=None, embed_model=None):
    """Helper function to create a new retriever"""
    if embed_model is None:
        embed_model = OllamaEmbeddings(model="nomic-embed-text")
    
    if urls is None:
        # Default URLs from your code
        urls = [
            "https://manipaltechnologies.com/",
            "https://manipaltechnologies.com/about-us/",
            "https://manipaltechnologies.com/careers/",
            "https://manipaltechnologies.com/contact-us/",
            "https://manipaltechnologies.com/blogs/",
            "https://manipaltechnologies.com/videos/",
            "https://manipaltechnologies.com/events/",
            "https://manipaltechnologies.com/downloads/",
            "https://manipaltechnologies.com/bfsi/sahibnk/",
            "https://manipaltechnologies.com/bfsi/digital-banking-smart-branches-solutions/",
            "https://manipaltechnologies.com/bfsi/crossfraud-suite/",
            "https://manipaltechnologies.com/bfsi/payment-solutions/",
            "https://manipaltechnologies.com/bfsi/card-management/",
            "https://manipaltechnologies.com/bfsi/secure-print-solution/",
            "https://manipaltechnologies.com/bfsi/financial-inclusion-solution/",
            "https://manipaltechnologies.com/bfsi/branding-communication/",
            "https://manipaltechnologies.com/bfsi/pms/",
            "https://manipaltechnologies.com/bfsi/corporate/",
            "https://manipaltechnologies.com/government/",
            "https://manipaltechnologies.com/publishing/",
            "https://manipaltechnologies.com/retail/",
            "https://www.linkedin.com/company/manipal-technologies-limited/",
            "https://manipaltechnologies.com/who-we-are/",
            "https://manipaltechnologies.com/who-we-are/team",
        ]
    
    loader = WebBaseLoader(urls)
    docs = loader.load()
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )
    
    # Split the documents
    split_docs = text_splitter.split_documents(docs)
    print(f"Split into {len(split_docs)} chunks.")
    
    # Create new retriever using the custom class with split documents
    return VectorStoreRetriever.from_docs(split_docs)


def get_or_create_retriever(urls=None):
    """
    Check if Chroma collection exists and load it, otherwise create a new one.
    
    Args:
        urls: List of URLs to fetch and embed if creating a new collection
        
    Returns:
        VectorStoreRetriever: The custom retriever wrapping ChromaDB
    """
    # Initialize embedding model
    embed_model = OllamaEmbeddings(model="nomic-embed-text")
    
    # Check if the ChromaDB directory exists
    if os.path.exists(CHROMA_PERSIST_DIRECTORY):
        print(f"Loading existing ChromaDB from {CHROMA_PERSIST_DIRECTORY}")
        # Load existing ChromaDB
        db = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=embed_model,
            persist_directory=CHROMA_PERSIST_DIRECTORY
        )
        
        # Check if collection has documents
        if db._collection.count() == 0:
            print("Collection exists but is empty. Creating new documents...")
            return create_new_retriever(urls, embed_model)
        else:
            print(f"Loaded collection with {db._collection.count()} documents")
            return VectorStoreRetriever(db)
    else:
        return create_new_retriever(urls, embed_model)

@tool
def lookup_policy(query: str) -> str:
    """
    Retrieve company-related information along with metadata as proof,
    including the source URL stored in metadata.
    """
    # Get or create the retriever
    retriever = get_or_create_retriever()
    
    # Query the retriever using the query method from your custom class
    retrieved_docs = retriever.query(query, k=2)
    
    results = []
    for doc in retrieved_docs:
        content = doc["page_content"]
        metadata = doc["metadata"]
        # Extract URL from metadata
        source_url = metadata.get("source", "URL not available")
        # Format all metadata for readability
        results.append(
            f"Content:\n{content}\n\nSource URL: {source_url}"
        )
    
    if not results:
        return "No relevant information found."
    
    return "\n\n---\n\n".join(results)


# Testing the functionality of lookup_policy that we just created
for chunk in lookup_policy.stream("what is this company?"):
    print(chunk, end="", flush=True)  # Print each chunk as it arrives

from langchain_core.messages import ToolMessage
from langchain_core.runnables import RunnableLambda

from langgraph.prebuilt import ToolNode


def handle_tool_error(state) -> dict:
    error = state.get("error")
    tool_calls = state["messages"][-1].tool_calls
    return {
        "messages": [
            ToolMessage(
                content=f"Error: {repr(error)}\n please fix your mistakes.",
                tool_call_id=tc["id"],
            )
            for tc in tool_calls
        ]
    }


def create_tool_node_with_fallback(tools: list) -> dict:
    return ToolNode(tools).with_fallbacks(
        [RunnableLambda(handle_tool_error)], exception_key="error"
    )


def _print_event(event: dict, _printed: set, max_length=1500):
    current_state = event.get("dialog_state")
    if current_state:
        print("Currently in: ", current_state[-1])
    message = event.get("messages")
    if message:
        if isinstance(message, list):
            message = message[-1]
        if message.id not in _printed:
            msg_repr = message.pretty_repr(html=True)
            if len(msg_repr) > max_length:
                msg_repr = msg_repr[:max_length] + " ... (truncated)"
            print(msg_repr)
            _printed.add(message.id)


from typing import Annotated

from typing_extensions import TypedDict

from langgraph.graph.message import AnyMessage, add_messages


class State(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]


from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable, RunnableConfig
from datetime import datetime
class Assistant:
    def __init__(self, runnable: Runnable):
        self.runnable = runnable

    def __call__(self, state: State, config: RunnableConfig):
        while True:
            configuration = config.get("configurable", {})
            passenger_id = configuration.get("passenger_id", None)
            state = {**state, "user_info": passenger_id}
            result = self.runnable.invoke(state)
            # If the LLM happens to return an empty response, we will re-prompt it
            # for an actual response.
            if not result.tool_calls and (
                not result.content
                or isinstance(result.content, list)
                and not result.content[0].get("text")
            ):
                messages = state["messages"] + [("user", "Respond with a real output.")]
                state = {**state, "messages": messages}
            else:
                break
        return {"messages": result}


# Using Groq model with the provided API key
llm = ChatGroq(
    model="qwen-qwq-32b",
    temperature=0.7,
    max_tokens=2400
)

primary_assistant_prompt = ChatPromptTemplate.from_messages(
    [
        (
           "system",
    "You are a helpful assistant for Manipal Technologies Limited."
    "When a question is asked by the user, first try to find the answer in URLs provided in the retriever function."
    "Use the provided tools to retrieve info for Manipal Technologies Limited's services, solutions, company policies, pricing information, and other relevant details ONLY when needed to answer specific user queries."
    "When retrieving is necessary, be persistent. Expand your query bounds if the first retrieval returns no results."
    "If a search comes up empty, refine and expand your search before concluding that no information is available."
    "Focus exclusively on providing information related to Manipal Technologies Limited and its offerings. Do not answer questions that are irrelevant to the company or its services."
    "You must only retrieve information about Manipal Technologies Limited. Do not retrieve or provide information unrelated to the company."
    "If the user query is related to Manipal Technologies Limited but cannot be directly answered, provide the company's contact details, such as the phone number and email, politely. Phone: +91 820 220 5000 and +91 820 427 5000; Email: presales.cf@manipalgroup.info"
    "If users ask about topics completely unrelated to Manipal Technologies Limited, do not answer the question. Instead, politely inform them that you can only assist with inquiries related to the company's services, solutions, or policies."
    "Do not provide any information that is not retrieved from the available sources. Do not answer from your existing knowledge. Always retrieve and answer based on the latest available data."
    "You may engage in casual conversation only if it helps the user understand Manipal Technologies Limited better, but avoid unrelated discussions."

    "\n\nCurrent user:\n<User>\n{user_info}\n</User>"
    "\nCurrent time: {time}."

        ("placeholder", "{messages}"),
        ),
    ]
).partial(time=datetime.now)

part_1_tools = [
    lookup_policy,
]
part_1_assistant_runnable = primary_assistant_prompt | llm.bind_tools(part_1_tools)


from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph, START
from langgraph.prebuilt import tools_condition

builder = StateGraph(State)


# Define nodes: these do the work
builder.add_node("assistant", Assistant(part_1_assistant_runnable))
builder.add_node("tools", create_tool_node_with_fallback(part_1_tools))
# Define edges: these determine how the control flow moves
builder.add_edge(START, "assistant")
builder.add_conditional_edges(
    "assistant",
    tools_condition,
)
builder.add_edge("tools", "assistant")

# The checkpointer lets the graph persist its state
# this is a complete memory for the entire graph.
memory = MemorySaver()
part_1_graph = builder.compile(checkpointer=memory)

import shutil
import uuid

# Let's create an example conversation a user might have with the assistant
tutorial_questions = [
    "give me the phone number to contact crossfraud",
]
thread_id = str(uuid.uuid4())

config = {
    "configurable": {
        # The passenger_id is used in our flight tools to
        # fetch the user's flight information
        "passenger_id": "3442 5872421",
        # Checkpoints are accessed by thread_id
        "thread_id": thread_id,
    }
}

_printed = set()
for question in tutorial_questions:
    events = part_1_graph.stream(
        {"messages": ("user", question)}, config, stream_mode="values"
    )
    for event in events:
        _print_event(event, _printed)