from langchain_core.messages import ToolMessage
from langchain_core.runnables import RunnableLambda
from langgraph.prebuilt import ToolNode
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable, RunnableConfig
from datetime import datetime
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import AnyMessage, add_messages
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph, START
from langgraph.prebuilt import tools_condition
from langchain_groq import ChatGroq
import uuid
from langembedding import lookup_policy  # Import from the embedding module
from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
class State(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]

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
        ("system",
            "You are a helpful assistant for Manipal Technologies Limited. "
            "When a question is asked by the user, first try to find the answer in URLs provided in the retriever function. "
            "Never use markdown symbols like *, **, or ```. "
            "conert text to simple if it is bold or italic"
            "Provide clean, paragraph-form responses. "
            "Use simple line breaks for separation. "
            "Structure information clearly without special formatting. "
            "Use the provided tools to retrieve info for Manipal Technologies Limited's services, solutions, company policies, pricing information, and other relevant details ONLY when needed to answer specific user queries. "
            "When retrieving is necessary, be persistent. Expand your query bounds if the first retrieval returns no results. "
            "If a search comes up empty, refine and expand your search before concluding that no information is available. "
            "Focus exclusively on providing information related to Manipal Technologies Limited and its offerings. Do not answer questions that are irrelevant to the company or its services. "
            "You must only retrieve information about Manipal Technologies Limited. Do not retrieve or provide information unrelated to the company. "
            "If the user query is related to Manipal Technologies Limited but cannot be directly answered, provide the company's contact details, such as the phone number and email, politely. Phone: +91 820 220 5000 and +91 820 427 5000; Email: info@manipalgroup.info "
            "If users ask about topics completely unrelated to Manipal Technologies Limited, do not answer the question. Instead, politely inform them that you can only assist with inquiries related to the company's services, solutions, or policies. "
            "Do not provide any information that is not retrieved from the available sources. Do not answer from your existing knowledge. Always retrieve and answer based on the latest available data. "
            "You may engage in casual conversation only if it helps the user understand Manipal Technologies Limited better, but avoid unrelated discussions."
            "\n\nCurrent user:\n<User>\n{user_info}\n</User>"
            "\nCurrent time: {time}."
        ),
        ("placeholder", "{messages}"),
    ]
).partial(time=datetime.now())
part_1_tools = [
    lookup_policy,
]
part_1_assistant_runnable = primary_assistant_prompt | llm.bind_tools(part_1_tools)

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

if __name__ == "__main__":
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