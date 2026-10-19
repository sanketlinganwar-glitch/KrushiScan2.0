#!/usr/bin/env python3
"""
KrushiScan AI — Official Agmarknet Mandi Rates Ingestion & Sync Service
Fetches genuine market arrival records from Government of India (data.gov.in)
and securely synchronizes them with the deployed KrushiScan backend.

Usage:
  python scripts/sync_mandi_rates.py
  python scripts/sync_mandi_rates.py --backend https://krushiscan2-0-1.onrender.com
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

def load_env_file(filepath: Path) -> dict:
    env_vars = {}
    if filepath.exists():
        for line in filepath.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars

def main():
    parser = argparse.ArgumentParser(description="Synchronize live Agmarknet mandi rates to KrushiScan backend.")
    parser.add_argument("--backend", default=os.getenv("BACKEND_URL", "https://krushiscan2-0-1.onrender.com"), help="Backend URL")
    parser.add_argument("--secret", default=os.getenv("MANDI_SYNC_SECRET", ""), help="Mandi sync auth secret")
    parser.add_argument("--limit", type=int, default=250, help="Record limit to fetch from data.gov.in")
    parser.add_argument("--state", default="Maharashtra", help="State filter")
    args = parser.parse_args()

    # Load environment variables if not present in os.environ
    root_dir = Path(__file__).resolve().parent.parent
    local_env = load_env_file(root_dir / ".env")
    backend_env = load_env_file(root_dir / "backend" / ".env")

    api_key = (
        os.getenv("DATA_GOV_IN_API_KEY") or
        backend_env.get("DATA_GOV_IN_API_KEY") or
        local_env.get("DATA_GOV_IN_API_KEY") or
        ""
    ).strip()

    sync_secret = (
        args.secret or
        os.getenv("MANDI_SYNC_SECRET") or
        backend_env.get("MANDI_SYNC_SECRET") or
        local_env.get("MANDI_SYNC_SECRET") or
        "krushiscan-mandi-sync-auth-token-2026"
    ).strip()

    if not api_key:
        print("ERROR: DATA_GOV_IN_API_KEY is not configured.", file=sys.stderr)
        sys.exit(1)

    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting Agmarknet data fetch for state '{args.state}'...")

    # 1. Fetch from Government of India Agmarknet endpoint
    endpoint = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    params = {
        "api-key": api_key,
        "format": "json",
        "filters[state]": args.state,
        "limit": str(args.limit)
    }
    url = f"{endpoint}?{urllib.parse.urlencode(params)}"
    headers = {
        "User-Agent": "KrushiScan-Agmarknet-Sync/2.0 (Agricultural Intelligence Pipeline; Maharashtra)",
        "Accept": "application/json"
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status != 200:
                print(f"ERROR: data.gov.in responded with HTTP {resp.status}", file=sys.stderr)
                sys.exit(2)
            raw_data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"ERROR: Failed to connect to data.gov.in upstream: {e}", file=sys.stderr)
        sys.exit(3)

    records = raw_data.get("records", [])
    total_available = raw_data.get("total", len(records))
    print(f"SUCCESS: Fetched {len(records)} records (out of {total_available} total available) from official data.gov.in API.")

    if not records:
        print("WARNING: Upstream returned an empty record set. Aborting sync.", file=sys.stderr)
        sys.exit(4)

    # Detect arrival date from records
    dates = [r.get("arrival_date") for r in records if r.get("arrival_date")]
    arrival_date = dates[0] if dates else datetime.now(timezone.utc).strftime("%d/%m/%Y")
    print(f"Original Arrival Date from records: {arrival_date}")

    # 2. Push verified records to KrushiScan backend
    sync_url = f"{args.backend.rstrip('/')}/api/mandi/sync"
    payload = {
        "records": records,
        "source": "Government of India AGMARKNET (data.gov.in)",
        "sourceUrl": "https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
        "arrivalDate": arrival_date
    }

    push_req = urllib.request.Request(
        sync_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Sync-Secret": sync_secret
        },
        method="POST"
    )

    print(f"Synchronizing {len(records)} verified records with backend at {sync_url}...")
    try:
        with urllib.request.urlopen(push_req, timeout=30) as push_resp:
            result = json.loads(push_resp.read().decode("utf-8"))
            print("BACKEND SYNC SUCCESS:")
            print(f"  Status: {result.get('status')}")
            print(f"  Records Parsed & Cached: {result.get('count')}")
            print(f"  Arrival Date: {result.get('sourceArrivalDate')}")
            print(f"  Fetched At: {result.get('lastFetchedAt')}")
    except urllib.error.HTTPError as he:
        body = he.read().decode("utf-8", errors="replace")
        print(f"ERROR: Backend returned HTTP {he.code}: {body}", file=sys.stderr)
        sys.exit(5)
    except Exception as e:
        print(f"ERROR: Failed to push data to backend: {e}", file=sys.stderr)
        sys.exit(6)

if __name__ == "__main__":
    main()
