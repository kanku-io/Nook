"""
Geocode venue addresses using Nominatim (OpenStreetMap) and write
latitude/longitude back to Supabase.

Setup:
    pip install supabase requests

    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3and2anVheWlndWVrd2V2Z21qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY3NDUxMywiZXhwIjoyMDk5MjUwNTEzfQ.l01mBHQvTfo_Gs8lnd1fHqWyF9HbHPAHFfs_QSUCDG0"

Run:
    python geocode_venues.py

Notes:
    - Nominatim's usage policy requires max 1 request/second and a
      real identifying User-Agent (not a generic library default) —
      both are handled below. Don't remove the sleep or the header.
    - Only geocodes venues where latitude/longitude are still NULL,
      so it's safe to re-run after adding new venues.
"""

import os
import time

import requests
from supabase import create_client

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    # Replace with something identifying your app + a contact,
    # per Nominatim's usage policy.
    "User-Agent": "NookApp/1.0 (contact: jesuskanku.za@gmail,com)"
}


def geocode(address: str, area: str, city: str, province: str):
    """Return (lat, lon) or (None, None) if no match found."""
    query_parts = [p for p in [address, area, city, province, "South Africa"] if p]
    query = ", ".join(query_parts)

    response = requests.get(
        NOMINATIM_URL,
        params={"q": query, "format": "json", "limit": 1},
        headers=HEADERS,
        timeout=10,
    )
    response.raise_for_status()
    results = response.json()

    if not results:
        return None, None

    return float(results[0]["lat"]), float(results[0]["lon"])


def main():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        print("Set SUPABASE_URL and SUPABASE_KEY environment variables first.")
        return

    supabase = create_client(url, key)

    # Only venues that haven't been geocoded yet
    result = (
        supabase.table("venues")
        .select("id, name, address, area, city, province")
        .is_("latitude", "null")
        .execute()
    )
    venues = result.data
    print(f"{len(venues)} venues need geocoding")

    geocoded, failed = 0, []

    for venue in venues:
        lat, lon = geocode(
            venue.get("address"),
            venue.get("area"),
            venue.get("city"),
            venue.get("province"),
        )

        if lat is None:
            print(f"  ✗ No match: {venue['name']}")
            failed.append(venue["name"])
        else:
            supabase.table("venues").update(
                {"latitude": lat, "longitude": lon}
            ).eq("id", venue["id"]).execute()
            print(f"  ✓ {venue['name']}: {lat}, {lon}")
            geocoded += 1

        # Required by Nominatim's usage policy: max 1 req/sec
        time.sleep(1)

    print(f"\nDone. Geocoded {geocoded}/{len(venues)}.")
    if failed:
        print("Couldn't geocode (check these addresses manually):")
        for name in failed:
            print(f"  - {name}")


if __name__ == "__main__":
    main()