import google.generativeai as genai
from .models import Ticket
from datetime import datetime, timedelta

# Configuration (Ensure this is called once in your app)
genai.configure(api_key="AIzaSyAXyRlM-889bjmyAyQCCSkxYz2yjB5QVJM-key")

def generate_queue_insights():
    # 1. Gather Data (Last 24 hours of tickets)
    yesterday = datetime.utcnow() - timedelta(days=1)
    tickets = Ticket.query.filter(Ticket.created_at >= yesterday).all()
    
    if not tickets:
        return "Not enough data collected in the last 24 hours to generate insights."

    # 2. Format data for the AI
    data_summary = [
        f"Ticket: {t.ticket_number}, Service: {t.service_type}, Priority: {t.priority_level}, Time: {t.created_at.strftime('%H:%M')}"
        for t in tickets
    ]
    data_string = "\n".join(data_summary)

    # 3. Construct the Prompt
    prompt = f"""
    You are an expert Operations Analyst for OfficeQ. 
    Analyze this queue data from the last 24 hours:
    {data_string}

    Please provide:
    1. A summary of the busiest service types.
    2. Identification of peak time bottlenecks.
    3. Two recommendations for staff allocation.
    """

    # 4. Call Legacy PaLM 2 (Compatible with your 0.1.0rc1 library)
    try:
        # In 0.1.0, we use generate_text with text-bison-001
        response = genai.generate_text(
            model='models/text-bison-001', 
            prompt=prompt,
            temperature=0.2, # Lower temperature for more factual analysis
            max_output_tokens=300
        )
        return response.result if response.result else "AI could not generate a report."
    except Exception as e:
        return f"AI Error: {str(e)}"