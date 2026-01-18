"""
Seed script for countries and ports
Creates comprehensive country and port data for international shipping
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from core.database import SessionLocalSettings
from modules.settings.models.company import Country, Port


def seed_countries(db: Session):
    """Seed major countries with ISO codes"""
    countries = [
        # Asia
        {"country_name": "Bangladesh", "country_code": "BGD", "country_code_2": "BD", "region": "Asia", "currency_code": "BDT", "phone_code": "+880"},
        {"country_name": "China", "country_code": "CHN", "country_code_2": "CN", "region": "Asia", "currency_code": "CNY", "phone_code": "+86"},
        {"country_name": "India", "country_code": "IND", "country_code_2": "IN", "region": "Asia", "currency_code": "INR", "phone_code": "+91"},
        {"country_name": "Vietnam", "country_code": "VNM", "country_code_2": "VN", "region": "Asia", "currency_code": "VND", "phone_code": "+84"},
        {"country_name": "Pakistan", "country_code": "PAK", "country_code_2": "PK", "region": "Asia", "currency_code": "PKR", "phone_code": "+92"},
        {"country_name": "Indonesia", "country_code": "IDN", "country_code_2": "ID", "region": "Asia", "currency_code": "IDR", "phone_code": "+62"},
        {"country_name": "Thailand", "country_code": "THA", "country_code_2": "TH", "region": "Asia", "currency_code": "THB", "phone_code": "+66"},
        {"country_name": "Cambodia", "country_code": "KHM", "country_code_2": "KH", "region": "Asia", "currency_code": "KHR", "phone_code": "+855"},
        {"country_name": "Myanmar", "country_code": "MMR", "country_code_2": "MM", "region": "Asia", "currency_code": "MMK", "phone_code": "+95"},
        {"country_name": "Sri Lanka", "country_code": "LKA", "country_code_2": "LK", "region": "Asia", "currency_code": "LKR", "phone_code": "+94"},
        {"country_name": "Japan", "country_code": "JPN", "country_code_2": "JP", "region": "Asia", "currency_code": "JPY", "phone_code": "+81"},
        {"country_name": "South Korea", "country_code": "KOR", "country_code_2": "KR", "region": "Asia", "currency_code": "KRW", "phone_code": "+82"},
        {"country_name": "Taiwan", "country_code": "TWN", "country_code_2": "TW", "region": "Asia", "currency_code": "TWD", "phone_code": "+886"},
        {"country_name": "Hong Kong", "country_code": "HKG", "country_code_2": "HK", "region": "Asia", "currency_code": "HKD", "phone_code": "+852"},
        {"country_name": "Singapore", "country_code": "SGP", "country_code_2": "SG", "region": "Asia", "currency_code": "SGD", "phone_code": "+65"},
        {"country_name": "Malaysia", "country_code": "MYS", "country_code_2": "MY", "region": "Asia", "currency_code": "MYR", "phone_code": "+60"},
        {"country_name": "Philippines", "country_code": "PHL", "country_code_2": "PH", "region": "Asia", "currency_code": "PHP", "phone_code": "+63"},
        {"country_name": "United Arab Emirates", "country_code": "ARE", "country_code_2": "AE", "region": "Middle East", "currency_code": "AED", "phone_code": "+971"},
        {"country_name": "Turkey", "country_code": "TUR", "country_code_2": "TR", "region": "Middle East", "currency_code": "TRY", "phone_code": "+90"},
        
        # Europe
        {"country_name": "United Kingdom", "country_code": "GBR", "country_code_2": "GB", "region": "Europe", "currency_code": "GBP", "phone_code": "+44"},
        {"country_name": "Germany", "country_code": "DEU", "country_code_2": "DE", "region": "Europe", "currency_code": "EUR", "phone_code": "+49"},
        {"country_name": "France", "country_code": "FRA", "country_code_2": "FR", "region": "Europe", "currency_code": "EUR", "phone_code": "+33"},
        {"country_name": "Italy", "country_code": "ITA", "country_code_2": "IT", "region": "Europe", "currency_code": "EUR", "phone_code": "+39"},
        {"country_name": "Spain", "country_code": "ESP", "country_code_2": "ES", "region": "Europe", "currency_code": "EUR", "phone_code": "+34"},
        {"country_name": "Netherlands", "country_code": "NLD", "country_code_2": "NL", "region": "Europe", "currency_code": "EUR", "phone_code": "+31"},
        {"country_name": "Belgium", "country_code": "BEL", "country_code_2": "BE", "region": "Europe", "currency_code": "EUR", "phone_code": "+32"},
        {"country_name": "Poland", "country_code": "POL", "country_code_2": "PL", "region": "Europe", "currency_code": "PLN", "phone_code": "+48"},
        {"country_name": "Portugal", "country_code": "PRT", "country_code_2": "PT", "region": "Europe", "currency_code": "EUR", "phone_code": "+351"},
        {"country_name": "Greece", "country_code": "GRC", "country_code_2": "GR", "region": "Europe", "currency_code": "EUR", "phone_code": "+30"},
        {"country_name": "Sweden", "country_code": "SWE", "country_code_2": "SE", "region": "Europe", "currency_code": "SEK", "phone_code": "+46"},
        {"country_name": "Denmark", "country_code": "DNK", "country_code_2": "DK", "region": "Europe", "currency_code": "DKK", "phone_code": "+45"},
        {"country_name": "Norway", "country_code": "NOR", "country_code_2": "NO", "region": "Europe", "currency_code": "NOK", "phone_code": "+47"},
        {"country_name": "Finland", "country_code": "FIN", "country_code_2": "FI", "region": "Europe", "currency_code": "EUR", "phone_code": "+358"},
        
        # Americas
        {"country_name": "United States", "country_code": "USA", "country_code_2": "US", "region": "North America", "currency_code": "USD", "phone_code": "+1"},
        {"country_name": "Canada", "country_code": "CAN", "country_code_2": "CA", "region": "North America", "currency_code": "CAD", "phone_code": "+1"},
        {"country_name": "Mexico", "country_code": "MEX", "country_code_2": "MX", "region": "North America", "currency_code": "MXN", "phone_code": "+52"},
        {"country_name": "Brazil", "country_code": "BRA", "country_code_2": "BR", "region": "South America", "currency_code": "BRL", "phone_code": "+55"},
        {"country_name": "Argentina", "country_code": "ARG", "country_code_2": "AR", "region": "South America", "currency_code": "ARS", "phone_code": "+54"},
        {"country_name": "Chile", "country_code": "CHL", "country_code_2": "CL", "region": "South America", "currency_code": "CLP", "phone_code": "+56"},
        {"country_name": "Colombia", "country_code": "COL", "country_code_2": "CO", "region": "South America", "currency_code": "COP", "phone_code": "+57"},
        {"country_name": "Peru", "country_code": "PER", "country_code_2": "PE", "region": "South America", "currency_code": "PEN", "phone_code": "+51"},
        
        # Africa
        {"country_name": "South Africa", "country_code": "ZAF", "country_code_2": "ZA", "region": "Africa", "currency_code": "ZAR", "phone_code": "+27"},
        {"country_name": "Egypt", "country_code": "EGY", "country_code_2": "EG", "region": "Africa", "currency_code": "EGP", "phone_code": "+20"},
        {"country_name": "Morocco", "country_code": "MAR", "country_code_2": "MA", "region": "Africa", "currency_code": "MAD", "phone_code": "+212"},
        {"country_name": "Kenya", "country_code": "KEN", "country_code_2": "KE", "region": "Africa", "currency_code": "KES", "phone_code": "+254"},
        {"country_name": "Ethiopia", "country_code": "ETH", "country_code_2": "ET", "region": "Africa", "currency_code": "ETB", "phone_code": "+251"},
        {"country_name": "Tunisia", "country_code": "TUN", "country_code_2": "TN", "region": "Africa", "currency_code": "TND", "phone_code": "+216"},
        {"country_name": "Mauritius", "country_code": "MUS", "country_code_2": "MU", "region": "Africa", "currency_code": "MUR", "phone_code": "+230"},
        
        # Oceania
        {"country_name": "Australia", "country_code": "AUS", "country_code_2": "AU", "region": "Oceania", "currency_code": "AUD", "phone_code": "+61"},
        {"country_name": "New Zealand", "country_code": "NZL", "country_code_2": "NZ", "region": "Oceania", "currency_code": "NZD", "phone_code": "+64"},
    ]
    
    for country_data in countries:
        existing = db.query(Country).filter(
            Country.country_code == country_data["country_code"]
        ).first()
        if not existing:
            country = Country(**country_data)
            db.add(country)
    
    db.commit()
    print(f"✓ {len(countries)} countries seeded")


def seed_ports(db: Session):
    """Seed major international ports"""
    # Get country IDs for reference
    countries = {c.country_code: c.id for c in db.query(Country).all()}
    
    ports = [
        # Bangladesh
        {"country_code": "BGD", "port_name": "Chittagong", "port_code": "BDCGP", "port_type": "Seaport", "latitude": 22.3569, "longitude": 91.7832},
        {"country_code": "BGD", "port_name": "Dhaka", "port_code": "BDDAC", "port_type": "Airport", "latitude": 23.8103, "longitude": 90.4125},
        {"country_code": "BGD", "port_name": "Mongla", "port_code": "BDMGL", "port_type": "Seaport", "latitude": 22.4833, "longitude": 89.6000},
        
        # China
        {"country_code": "CHN", "port_name": "Shanghai", "port_code": "CNSHA", "port_type": "Seaport", "latitude": 31.2304, "longitude": 121.4737},
        {"country_code": "CHN", "port_name": "Shenzhen", "port_code": "CNSZX", "port_type": "Seaport", "latitude": 22.5431, "longitude": 114.0579},
        {"country_code": "CHN", "port_name": "Ningbo", "port_code": "CNNGB", "port_type": "Seaport", "latitude": 29.8683, "longitude": 121.5440},
        {"country_code": "CHN", "port_name": "Guangzhou", "port_code": "CNGZH", "port_type": "Seaport", "latitude": 23.1291, "longitude": 113.2644},
        {"country_code": "CHN", "port_name": "Qingdao", "port_code": "CNTAO", "port_type": "Seaport", "latitude": 36.0671, "longitude": 120.3826},
        {"country_code": "CHN", "port_name": "Tianjin", "port_code": "CNTSN", "port_type": "Seaport", "latitude": 39.1422, "longitude": 117.1767},
        {"country_code": "CHN", "port_name": "Hong Kong", "port_code": "HKHKG", "port_type": "Seaport", "latitude": 22.3193, "longitude": 114.1694},
        
        # India
        {"country_code": "IND", "port_name": "Mumbai", "port_code": "INBOM", "port_type": "Seaport", "latitude": 18.9750, "longitude": 72.8258},
        {"country_code": "IND", "port_name": "Chennai", "port_code": "INMAA", "port_type": "Seaport", "latitude": 13.0827, "longitude": 80.2707},
        {"country_code": "IND", "port_name": "Kolkata", "port_code": "INCCU", "port_type": "Seaport", "latitude": 22.5726, "longitude": 88.3639},
        {"country_code": "IND", "port_name": "Delhi", "port_code": "INDEL", "port_type": "Airport", "latitude": 28.7041, "longitude": 77.1025},
        {"country_code": "IND", "port_name": "Nhava Sheva", "port_code": "INNSA", "port_type": "Seaport", "latitude": 18.9500, "longitude": 72.9500},
        
        # Vietnam
        {"country_code": "VNM", "port_name": "Ho Chi Minh City", "port_code": "VNSGN", "port_type": "Seaport", "latitude": 10.8231, "longitude": 106.6297},
        {"country_code": "VNM", "port_name": "Haiphong", "port_code": "VNHPH", "port_type": "Seaport", "latitude": 20.8449, "longitude": 106.6881},
        {"country_code": "VNM", "port_name": "Hanoi", "port_code": "VNHAN", "port_type": "Airport", "latitude": 21.0285, "longitude": 105.8542},
        
        # United States
        {"country_code": "USA", "port_name": "Los Angeles", "port_code": "USLAX", "port_type": "Seaport", "latitude": 33.7405, "longitude": -118.2720},
        {"country_code": "USA", "port_name": "Long Beach", "port_code": "USLGB", "port_type": "Seaport", "latitude": 33.7701, "longitude": -118.1937},
        {"country_code": "USA", "port_name": "New York", "port_code": "USNYC", "port_type": "Seaport", "latitude": 40.7128, "longitude": -74.0060},
        {"country_code": "USA", "port_name": "Savannah", "port_code": "USSAV", "port_type": "Seaport", "latitude": 32.0809, "longitude": -81.0912},
        {"country_code": "USA", "port_name": "Houston", "port_code": "USHOU", "port_type": "Seaport", "latitude": 29.7604, "longitude": -95.3698},
        {"country_code": "USA", "port_name": "Seattle", "port_code": "USSEA", "port_type": "Seaport", "latitude": 47.6062, "longitude": -122.3321},
        {"country_code": "USA", "port_name": "Oakland", "port_code": "USOAK", "port_type": "Seaport", "latitude": 37.8044, "longitude": -122.2712},
        {"country_code": "USA", "port_name": "Miami", "port_code": "USMIA", "port_type": "Seaport", "latitude": 25.7617, "longitude": -80.1918},
        
        # United Kingdom
        {"country_code": "GBR", "port_name": "London", "port_code": "GBLON", "port_type": "Seaport", "latitude": 51.5074, "longitude": -0.1278},
        {"country_code": "GBR", "port_name": "Felixstowe", "port_code": "GBFXT", "port_type": "Seaport", "latitude": 51.9642, "longitude": 1.3515},
        {"country_code": "GBR", "port_name": "Southampton", "port_code": "GBSOU", "port_type": "Seaport", "latitude": 50.9097, "longitude": -1.4044},
        {"country_code": "GBR", "port_name": "Liverpool", "port_code": "GBLIV", "port_type": "Seaport", "latitude": 53.4084, "longitude": -2.9916},
        
        # Germany
        {"country_code": "DEU", "port_name": "Hamburg", "port_code": "DEHAM", "port_type": "Seaport", "latitude": 53.5511, "longitude": 9.9937},
        {"country_code": "DEU", "port_name": "Bremerhaven", "port_code": "DEBRV", "port_type": "Seaport", "latitude": 53.5396, "longitude": 8.5809},
        {"country_code": "DEU", "port_name": "Frankfurt", "port_code": "DEFRA", "port_type": "Airport", "latitude": 50.1109, "longitude": 8.6821},
        
        # Netherlands
        {"country_code": "NLD", "port_name": "Rotterdam", "port_code": "NLRTM", "port_type": "Seaport", "latitude": 51.9225, "longitude": 4.4792},
        {"country_code": "NLD", "port_name": "Amsterdam", "port_code": "NLAMS", "port_type": "Seaport", "latitude": 52.3676, "longitude": 4.9041},
        
        # Belgium
        {"country_code": "BEL", "port_name": "Antwerp", "port_code": "BEANR", "port_type": "Seaport", "latitude": 51.2194, "longitude": 4.4025},
        
        # France
        {"country_code": "FRA", "port_name": "Le Havre", "port_code": "FRLEH", "port_type": "Seaport", "latitude": 49.4944, "longitude": 0.1079},
        {"country_code": "FRA", "port_name": "Marseille", "port_code": "FRMRS", "port_type": "Seaport", "latitude": 43.2965, "longitude": 5.3698},
        {"country_code": "FRA", "port_name": "Paris", "port_code": "FRPAR", "port_type": "Airport", "latitude": 48.8566, "longitude": 2.3522},
        
        # Italy
        {"country_code": "ITA", "port_name": "Genoa", "port_code": "ITGOA", "port_type": "Seaport", "latitude": 44.4056, "longitude": 8.9463},
        {"country_code": "ITA", "port_name": "La Spezia", "port_code": "ITLSP", "port_type": "Seaport", "latitude": 44.1024, "longitude": 9.8246},
        
        # Spain
        {"country_code": "ESP", "port_name": "Barcelona", "port_code": "ESBCN", "port_type": "Seaport", "latitude": 41.3851, "longitude": 2.1734},
        {"country_code": "ESP", "port_name": "Valencia", "port_code": "ESVLC", "port_type": "Seaport", "latitude": 39.4699, "longitude": -0.3763},
        
        # Singapore
        {"country_code": "SGP", "port_name": "Singapore", "port_code": "SGSIN", "port_type": "Seaport", "latitude": 1.3521, "longitude": 103.8198},
        
        # Japan
        {"country_code": "JPN", "port_name": "Tokyo", "port_code": "JPTYO", "port_type": "Seaport", "latitude": 35.6762, "longitude": 139.6503},
        {"country_code": "JPN", "port_name": "Yokohama", "port_code": "JPYOK", "port_type": "Seaport", "latitude": 35.4437, "longitude": 139.6380},
        {"country_code": "JPN", "port_name": "Osaka", "port_code": "JPOSA", "port_type": "Seaport", "latitude": 34.6937, "longitude": 135.5023},
        
        # South Korea
        {"country_code": "KOR", "port_name": "Busan", "port_code": "KRPUS", "port_type": "Seaport", "latitude": 35.1796, "longitude": 129.0756},
        {"country_code": "KOR", "port_name": "Incheon", "port_code": "KRINC", "port_type": "Seaport", "latitude": 37.4563, "longitude": 126.7052},
        
        # UAE
        {"country_code": "ARE", "port_name": "Dubai", "port_code": "AEDXB", "port_type": "Seaport", "latitude": 25.2048, "longitude": 55.2708},
        {"country_code": "ARE", "port_name": "Abu Dhabi", "port_code": "AEAUH", "port_type": "Seaport", "latitude": 24.4539, "longitude": 54.3773},
        
        # Turkey
        {"country_code": "TUR", "port_name": "Istanbul", "port_code": "TRIST", "port_type": "Seaport", "latitude": 41.0082, "longitude": 28.9784},
        {"country_code": "TUR", "port_name": "Izmir", "port_code": "TRIZM", "port_type": "Seaport", "latitude": 38.4237, "longitude": 27.1428},
        
        # Pakistan
        {"country_code": "PAK", "port_name": "Karachi", "port_code": "PKKHI", "port_type": "Seaport", "latitude": 24.8607, "longitude": 67.0011},
        
        # Thailand
        {"country_code": "THA", "port_name": "Bangkok", "port_code": "THBKK", "port_type": "Seaport", "latitude": 13.7563, "longitude": 100.5018},
        {"country_code": "THA", "port_name": "Laem Chabang", "port_code": "THLCH", "port_type": "Seaport", "latitude": 13.0827, "longitude": 100.8833},
        
        # Malaysia
        {"country_code": "MYS", "port_name": "Port Klang", "port_code": "MYPKG", "port_type": "Seaport", "latitude": 3.0044, "longitude": 101.3925},
        {"country_code": "MYS", "port_name": "Kuala Lumpur", "port_code": "MYKUL", "port_type": "Airport", "latitude": 3.1390, "longitude": 101.6869},
        
        # Indonesia
        {"country_code": "IDN", "port_name": "Jakarta", "port_code": "IDJKT", "port_type": "Seaport", "latitude": -6.2088, "longitude": 106.8456},
        {"country_code": "IDN", "port_name": "Surabaya", "port_code": "IDSUB", "port_type": "Seaport", "latitude": -7.2575, "longitude": 112.7521},
        
        # Australia
        {"country_code": "AUS", "port_name": "Sydney", "port_code": "AUSYD", "port_type": "Seaport", "latitude": -33.8688, "longitude": 151.2093},
        {"country_code": "AUS", "port_name": "Melbourne", "port_code": "AUMEL", "port_type": "Seaport", "latitude": -37.8136, "longitude": 144.9631},
        {"country_code": "AUS", "port_name": "Brisbane", "port_code": "AUBNE", "port_type": "Seaport", "latitude": -27.4698, "longitude": 153.0251},
        
        # Canada
        {"country_code": "CAN", "port_name": "Vancouver", "port_code": "CAVAN", "port_type": "Seaport", "latitude": 49.2827, "longitude": -123.1207},
        {"country_code": "CAN", "port_name": "Montreal", "port_code": "CAMTR", "port_type": "Seaport", "latitude": 45.5017, "longitude": -73.5673},
        {"country_code": "CAN", "port_name": "Toronto", "port_code": "CATOR", "port_type": "Airport", "latitude": 43.6532, "longitude": -79.3832},
        
        # Brazil
        {"country_code": "BRA", "port_name": "Santos", "port_code": "BRSSZ", "port_type": "Seaport", "latitude": -23.9608, "longitude": -46.3336},
        {"country_code": "BRA", "port_name": "Rio de Janeiro", "port_code": "BRRIO", "port_type": "Seaport", "latitude": -22.9068, "longitude": -43.1729},
        
        # South Africa
        {"country_code": "ZAF", "port_name": "Durban", "port_code": "ZADUR", "port_type": "Seaport", "latitude": -29.8587, "longitude": 31.0218},
        {"country_code": "ZAF", "port_name": "Cape Town", "port_code": "ZACPT", "port_type": "Seaport", "latitude": -33.9249, "longitude": 18.4241},
        
        # Egypt
        {"country_code": "EGY", "port_name": "Port Said", "port_code": "EGPSD", "port_type": "Seaport", "latitude": 31.2653, "longitude": 32.3019},
        {"country_code": "EGY", "port_name": "Alexandria", "port_code": "EGALY", "port_type": "Seaport", "latitude": 31.2001, "longitude": 29.9187},
        
        # Sri Lanka
        {"country_code": "LKA", "port_name": "Colombo", "port_code": "LKCMB", "port_type": "Seaport", "latitude": 6.9271, "longitude": 79.8612},
        
        # Philippines
        {"country_code": "PHL", "port_name": "Manila", "port_code": "PHMNL", "port_type": "Seaport", "latitude": 14.5995, "longitude": 120.9842},
        
        # Mexico
        {"country_code": "MEX", "port_name": "Manzanillo", "port_code": "MXZLO", "port_type": "Seaport", "latitude": 19.0544, "longitude": -104.3188},
        {"country_code": "MEX", "port_name": "Veracruz", "port_code": "MXVER", "port_type": "Seaport", "latitude": 19.1738, "longitude": -96.1342},
    ]
    
    for port_data in ports:
        country_code = port_data.pop("country_code")
        country_id = countries.get(country_code)
        if country_id:
            existing = db.query(Port).filter(
                Port.port_code == port_data["port_code"]
            ).first()
            if not existing:
                port = Port(country_id=country_id, **port_data)
                db.add(port)
    
    db.commit()
    print(f"✓ {len(ports)} ports seeded")


def run_seed():
    """Run all country and port seed functions"""
    print("\n=== Seeding Countries and Ports ===\n")
    
    with SessionLocalSettings() as db:
        try:
            seed_countries(db)
            seed_ports(db)
            
            print("\n✓ All countries and ports seeded successfully!\n")
        except Exception as e:
            print(f"\n✗ Error seeding countries and ports: {e}\n")
            db.rollback()
            raise


if __name__ == "__main__":
    run_seed()
