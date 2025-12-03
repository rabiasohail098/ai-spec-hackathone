#!/usr/bin/env python3
"""
Script to run the book content import to Qdrant
"""

import os
import sys
import argparse

# Add the project root to sys.path so we can import modules
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from scripts.import_book_content import main as import_main


def main():
    """Main function to run the import script"""
    parser = argparse.ArgumentParser(description='Import book content into Qdrant')
    parser.add_argument('--clear', action='store_true', help='Clear existing collection before importing')
    args = parser.parse_args()

    print("Starting book content import to Qdrant...")

    if args.clear:
        print("Clearing existing collection...")
        from app.database.vector_store import vector_store
        vector_store.clear_collection()

    # Run the import
    import_main()

    print("Import completed successfully!")


if __name__ == "__main__":
    main()