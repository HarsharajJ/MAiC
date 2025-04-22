import re
import numpy as np
import requests
from langchain_core.tools import tool
from langchain_ollama.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv



load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
# Set Groq API key
os.environ["GROQ_API_KEY"] = api_key

# Define path for storing ChromaDB
CHROMA_PERSIST_DIRECTORY = "chroma_store2"
COLLECTION_NAME = "mtl_documents"

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

def create_new_retriever(
    urls=None,
    pdf_dir="pdf",# Replace this with your main folder name; insted which all the pdf documents are presents
    embed_model=None
):
    """Creates a unified retriever using web pages and PDFs"""
    
    if embed_model is None:
        embed_model = OllamaEmbeddings(model="nomic-embed-text")
    
    # Default URLs if none provided
    if urls is None:
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
    
    # Load documents from web
    print("Loading web pages...")
    web_loader = WebBaseLoader(urls)
    web_docs = web_loader.load()
    
    # Load documents from PDF directory
    print("Loading PDFs...")
    pdf_docs = []
    for filename in os.listdir(pdf_dir):
        if filename.lower().endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(pdf_dir, filename), mode="page")
            pdf_docs.extend(loader.load())

    print(f"Loaded {len(web_docs)} web docs and {len(pdf_docs)} PDF docs.")

    # Combine all docs
    all_docs = web_docs + pdf_docs

    # Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )
    split_docs = text_splitter.split_documents(all_docs)
    print(f"Split into {len(split_docs)} chunks.")

    # Create and return retriever
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
            return create_new_retriever(urls = urls, embed_model = embed_model)
        else:
            print(f"Loaded collection with {db._collection.count()} documents")
            return VectorStoreRetriever(db)
    else:
        return create_new_retriever(urls = urls, embed_model= embed_model)
@tool
def lookup_policy(query: str) -> str:
    """
    Retrieve company information with these formatting rules:
    - No markdown or special formatting
    - Clean paragraph structure
    - Include source URLs
    - Separate multiple points with line breaks
    """
    retriever = get_or_create_retriever()
    retrieved_docs = retriever.query(query, k=2)
    
    results = []
    for doc in retrieved_docs:
        content = doc["page_content"]
        source_url = doc["metadata"].get("source", "URL not available")
        
        # Clean formatting from the content
        clean_content = re.sub(r'\*+', '', content)  # Remove asterisks
        clean_content = re.sub(r'`+', '', clean_content)  # Remove backticks
        
        results.append(
            f"Information: {clean_content}\n"
            f"Source: {source_url}\n"
        )
    
    return "\n".join(results) if results else "No relevant information found."

# For testing the embedding functionality
if __name__ == "__main__":
    # Testing the functionality of lookup_policy that we just created
    for chunk in lookup_policy.stream("what is this company?"):
        print(chunk, end="", flush=True)  # Print each chunk as it arrives