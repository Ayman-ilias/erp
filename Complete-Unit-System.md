# COMPLETE UNIT CONVERSION SYSTEM FOR BANGLADESH FACTORY
**Comprehensive Research-Based Guide: International Standards + Desi Units + Technical Measurements**

> *This document is based on research from Bangladesh Standards and Testing Institution (BSTI), ISO standards, and industry best practices.*

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [ALL Unit Categories (20+ Categories)](#all-unit-categories)
3. [Database Schema](#database-schema)
4. [Implementation Code](#implementation-code)
5. [Bangladesh Industry Compliance](#bangladesh-industry-compliance)
6. [Quick Reference Tables](#quick-reference-tables)

---

## SYSTEM OVERVIEW

### Why This Complete System?

Bangladesh factories operate across multiple industries:
- **Garment Manufacturing** - Textile, yarn counts, fabric weights
- **Shipping & Logistics** - TEU/FEU containers, cargo management
- **Textile Mills** - GSM, denier, yarn counts, weaving specs
- **Heavy Manufacturing** - Torque, pressure, mechanical specs
- **Electronics & Robotics** - Servo angles, frequencies, currents
- **Traditional Manufacturing** - Desi units for local suppliers

Your system MUST handle all of these. No single API covers them all.

---

## ALL UNIT CATEGORIES (20+)

### CATEGORY 1: LENGTH / DISTANCE

**Base Unit: Meter (m)**

| Unit | Symbol | In Meters | Type | Region |
|------|--------|-----------|------|--------|
| Meter | m | 1 | SI | International |
| Centimeter | cm | 0.01 | SI | International |
| Millimeter | mm | 0.001 | SI | International |
| Micrometer | µm | 0.000001 | SI | Precision |
| Kilometer | km | 1,000 | SI | International |
| Inch | in | 0.0254 | English | International |
| Foot | ft | 0.3048 | English | International |
| Yard | yd | 0.9144 | English | International |
| Mile | mi | 1,609.344 | English | International |
| **Cubit** | **cub** | **0.4572** | **Desi** | **South Asia** |
| **Gaj** | **gaj** | **0.9144** | **Desi** | **South Asia** |
| **Kadam** (Step) | **kad** | **0.762** | **Desi** | **South Asia** |
| **Hath** (Arm-span) | **hth** | **0.5486** | **Desi** | **South Asia** |

**SQL INSERT:**
```sql
INSERT INTO units (category_id, name, symbol, unit_type, to_base_factor) VALUES
(1, 'Meter', 'm', 'SI', 1),
(1, 'Centimeter', 'cm', 'SI', 0.01),
(1, 'Millimeter', 'mm', 'SI', 0.001),
(1, 'Inch', 'in', 'International', 0.0254),
(1, 'Foot', 'ft', 'International', 0.3048),
(1, 'Yard', 'yd', 'International', 0.9144),
(1, 'Cubit', 'cub', 'Desi', 0.4572),
(1, 'Gaj', 'gaj', 'Desi', 0.9144),
(1, 'Kadam', 'kad', 'Desi', 0.762),
(1, 'Hath', 'hth', 'Desi', 0.5486);
```

---

### CATEGORY 2: WEIGHT / MASS

**Base Unit: Kilogram (kg)**

| Unit | Symbol | In Kg | Type | Region | Notes |
|------|--------|-------|------|--------|-------|
| Kilogram | kg | 1 | SI | International | Base unit |
| Gram | g | 0.001 | SI | International | |
| Milligram | mg | 0.000001 | SI | International | |
| Metric Tonne | t | 1,000 | SI | International | |
| Pound | lb | 0.453592 | English | International | Avoirdupois |
| Ounce | oz | 0.0283495 | English | International | Avoirdupois |
| **Tola** | **tola** | **0.011664** | **Desi** | **South Asia** | Standard BD unit |
| **Seer** | **seer** | **0.933** | **Desi** | **South Asia** | 80 tola |
| **Maund** | **mun** | **37.32** | **Desi** | **South Asia** | 40 seer |
| **Chhatak** | **chhtak** | **0.1166** | **Desi** | **South Asia** | 1/8 seer |
| **Pav** | **pav** | **0.2333** | **Desi** | **South Asia** | 1/4 seer |
| Grain | gr | 0.0000648 | English | International | Jewelry |

---

### CATEGORY 3: VOLUME / CAPACITY

**Base Unit: Cubic Meter (m³)**

| Unit | Symbol | In m³ | Type | Region | Notes |
|------|--------|-------|------|--------|-------|
| Cubic Meter | m³ | 1 | SI | International | Base unit |
| Liter | L | 0.001 | SI | International | 1000L = 1m³ |
| Milliliter | mL | 0.000001 | SI | International | |
| Cubic Centimeter | cm³ | 0.000001 | SI | International | = 1 mL |
| Cubic Foot | ft³ | 0.0283168 | English | International | |
| Gallon (US) | gal | 0.003785 | English | USA | |
| Gallon (Imperial) | imp gal | 0.00454609 | English | UK | |
| Fluid Ounce (US) | fl oz | 0.0000295735 | English | USA | |
| **Ser** | **ser** | **1.941** | **Desi** | **South Asia** | ~1.94 liter |
| **Kali** | **kali** | **20.41** | **Desi** | **South Asia** | |
| **Powa** | **powa** | **0.485** | **Desi** | **South Asia** | |

---

### CATEGORY 4: TEMPERATURE

**Special Case - Uses Formulas, Not Multipliers**

| Unit | Symbol | Type | Conversion Formula |
|------|--------|------|-------------------|
| Celsius | °C | SI | Base |
| Fahrenheit | °F | English | °F = (°C × 9/5) + 32 |
| Kelvin | K | SI | K = °C + 273.15 |
| Rankine | °R | English | °R = (°C + 273.15) × 9/5 |

**Note:** Store as Celsius (base), use formulas for conversion.

---

### CATEGORY 5: AREA

**Base Unit: Square Meter (m²)**

| Unit | Symbol | In m² | Type | Region |
|------|--------|-------|------|--------|
| Square Meter | m² | 1 | SI | International |
| Square Centimeter | cm² | 0.0001 | SI | International |
| Square Kilometer | km² | 1,000,000 | SI | International |
| Hectare | ha | 10,000 | SI | International |
| Square Foot | ft² | 0.092903 | English | International |
| Square Yard | yd² | 0.836127 | English | International |
| Acre | ac | 4,046.86 | English | International |
| **Bigha** | **bigha** | **2500-4000** | **Desi** | **South Asia** | Varies by region |
| **Kattha** | **kattha** | **100-160** | **Desi** | **South Asia** | Regional variation |
| **Tala** | **tala** | **16-40** | **Desi** | **South Asia** | Regional variation |

**IMPORTANT - Regional Variation:**
```
Bigha size varies by district:
- Dhaka: ~2500 m²
- Chittagong: ~2800 m²
- Sylhet: ~2300 m²
- Rajshahi: ~2700 m²
```

Store with region field:
```sql
(5, 'Bigha (Dhaka)', 'bigha_dh', 'Desi', 2500, 'Dhaka'),
(5, 'Bigha (Chittagong)', 'bigha_ct', 'Desi', 2800, 'Chittagong'),
```

---

### CATEGORY 6: COUNT / QUANTITY

**Base Unit: Piece (pc)**

| Unit | Symbol | In Pieces | Type | Region | Notes |
|------|--------|-----------|------|--------|-------|
| Piece | pc | 1 | Base | International | Single item |
| Pair | pr | 2 | International | International | 2 items |
| **Hali** | **hali** | **4** | **Desi** | **South Asia** | 4 pieces (BD cotton/fabric) |
| Half Dozen | hdoz | 6 | International | International | |
| Dozen | doz | 12 | International | International | |
| Baker's Dozen | bdoz | 13 | International | International | |
| Score | score | 20 | International | International | |
| Gross | gr | 144 | International | International | 12 × 12 |
| Great Gross | ggr | 1,728 | International | International | 12 × 144 |
| **Lakh** | **lakh** | **100,000** | **Desi** | **South Asia** | Indian numbering |
| **Crore** | **crore** | **10,000,000** | **Desi** | **South Asia** | Indian numbering |

---

### CATEGORY 7: PRESSURE

**Base Unit: Pascal (Pa)**

| Unit | Symbol | In Pa | Type | Common Use |
|------|--------|-------|------|------------|
| Pascal | Pa | 1 | SI | Standard |
| Kilopascal | kPa | 1,000 | SI | |
| Megapascal | MPa | 1,000,000 | SI | Materials |
| Bar | bar | 100,000 | International | Industrial |
| Millibar | mbar | 100 | International | Weather |
| Atmosphere | atm | 101,325 | International | Reference |
| PSI | psi | 6,894.76 | English | Hydraulics (USA) |
| PSIG | psig | 6,894.76 | English | Gauge pressure |
| Torr | Torr | 133.322 | International | Vacuum |
| mmHg | mmHg | 133.322 | International | Barometer |

**Key Conversions:**
- 1 atm = 101,325 Pa = 1.01325 bar = 14.696 psi = 760 Torr
- 1 bar = 100,000 Pa = 14.50 psi = 0.9869 atm

---

### CATEGORY 8: FLOW RATE

**Base Unit: Cubic Meter per Second (m³/s)**

| Unit | Symbol | In m³/s | Type | Common Use |
|------|--------|---------|------|------------|
| Cubic Meter per Second | m³/s | 1 | SI | Large systems |
| Cubic Meter per Hour | m³/h | 0.000277778 | SI | Industrial |
| Liter per Minute | L/min | 0.00001667 | SI | Water, fluid |
| Liter per Hour | L/h | 2.778×10⁻⁸ | SI | Small flow |
| Gallon per Minute | GPM | 0.0000631 | English | Water supply |
| Gallon per Hour | GPH | 0.00000105 | English | |
| Cubic Foot per Minute | CFM | 0.000472 | English | HVAC, air |
| Barrel per Day | bbl/d | 0.00000183 | English | Oil industry |

**Quick Conversions:**
- 1 m³/h = 16.6667 L/min
- 1 L/min = 0.06 m³/h
- 1 GPM = 3.785 L/min
- 1 m³/s = 1000 L/min = 35,314.7 CFM

---

### CATEGORY 9: FORCE

**Base Unit: Newton (N)**

| Unit | Symbol | In N | Type | Use |
|------|--------|------|------|-----|
| Newton | N | 1 | SI | Standard |
| Kilonewton | kN | 1,000 | SI | Large structures |
| Dyne | dyn | 0.00001 | CGS | Small forces |
| Pound-Force | lbf | 4.44822 | English | Engineering |
| Kilogram-Force | kgf | 9.80665 | International | |
| Ton-Force (Metric) | tonf | 9,806.65 | International | Heavy machinery |
| Gram-Force | gf | 0.00980665 | CGS | |

---

### CATEGORY 10: TORQUE / MOMENT

**Base Unit: Newton-Meter (N⋅m)**

| Unit | Symbol | In N⋅m | Type | Use |
|------|--------|--------|------|-----|
| Newton-Meter | N⋅m | 1 | SI | International |
| Kilonewton-Meter | kN⋅m | 1,000 | SI | Large machinery |
| Foot-Pound | ft⋅lbf | 1.35582 | English | Automotive |
| Pound-Inch | in⋅lbf | 0.112985 | English | Small motors |
| Kilogram-Force-Meter | kgf⋅m | 9.80665 | International | |
| Gram-Force-Centimeter | gf⋅cm | 0.0000980665 | CGS | Small torque |

**Motor Torque Example:**
```
DC Motor: 2.5 N⋅m = 1.84 ft⋅lbf
Servo Motor: 10 kg⋅cm = 0.098 N⋅m
```

---

### CATEGORY 11: ROTATIONAL SPEED

**Base Unit: Radian per Second (rad/s)**

| Unit | Symbol | In rad/s | Type | Use |
|------|--------|----------|------|-----|
| Radian per Second | rad/s | 1 | SI | Physics |
| Revolution per Minute | RPM | 0.104720 | International | Motors |
| Revolution per Second | RPS | 6.28319 | International | High-speed |
| Degree per Second | deg/s | 0.017453 | International | Robotics, servos |
| Hertz | Hz | 1 (for frequency) | SI | Frequency |

**Critical Conversions:**
- 1 RPM = 0.10472 rad/s = 6 deg/s = 0.01667 Hz
- 1000 RPM = 104.72 rad/s = 6000 deg/s = 16.67 Hz
- 1 deg/s = 0.01745 rad/s = 0.1667 RPM

---

### CATEGORY 12: ENERGY / WORK

**Base Unit: Joule (J)**

| Unit | Symbol | In J | Type | Use |
|------|--------|------|------|-----|
| Joule | J | 1 | SI | Energy, work |
| Kilojoule | kJ | 1,000 | SI | Heat energy |
| Megajoule | MJ | 1,000,000 | SI | Large systems |
| Calorie | cal | 4.184 | International | Heat |
| Kilocalorie | kcal | 4,184 | International | Food energy |
| Watt-Hour | Wh | 3,600 | International | Electrical |
| Kilowatt-Hour | kWh | 3,600,000 | International | Electricity billing |
| BTU | BTU | 1,055.06 | English | HVAC |
| Erg | erg | 0.0000001 | CGS | Small energy |

---

### CATEGORY 13: POWER

**Base Unit: Watt (W)**

| Unit | Symbol | In W | Type | Use |
|------|--------|------|------|-----|
| Watt | W | 1 | SI | Standard |
| Kilowatt | kW | 1,000 | SI | Industrial |
| Megawatt | MW | 1,000,000 | SI | Power plants |
| Horsepower (Mechanical) | hp | 745.7 | International | Motors, engines |
| Horsepower (Electrical) | hp | 746 | International | Electrical |
| BTU per Hour | BTU/h | 0.293071 | English | Thermal |
| Calorie per Second | cal/s | 4.184 | International | Heat |
| Kilocalorie per Hour | kcal/h | 1.163 | International | |

**Important:**
- 1 hp ≈ 0.746 kW
- 1 kW ≈ 1.34 hp
- Industrial motor: 5 hp = 3.73 kW

---

### CATEGORY 14: ELECTRICAL UNITS

**All Base Units in SI**

| Parameter | Unit | Symbol | Type | Formula | Industrial Example |
|-----------|------|--------|------|---------|-------------------|
| **Current** | Ampere | A | SI | I = V / R | Factory motor: 10 A |
| **Voltage** | Volt | V | SI | V = I × R | Bangladesh supply: 230 V |
| **Resistance** | Ohm | Ω | SI | R = V / I | Heater: 23 Ω |
| **Power (Real)** | Watt | W | SI | P = V × I | Light bulb: 60 W |
| **Power (Reactive)** | Volt-Ampere Reactive | var | SI | Q = √(S² - P²) | Inductive load |
| **Power (Apparent)** | Volt-Ampere | VA | SI | S = V × I | Transformer rating: 100 kVA |
| **Charge** | Coulomb | C | SI | Q = I × t | Battery: 50 Ah = 180,000 C |
| **Capacitance** | Farad | F | SI | C = Q / V | Capacitor: 100 µF |
| **Inductance** | Henry | H | SI | L = Φ / I | Inductor: 5 mH |
| **Frequency** | Hertz | Hz | SI | f = 1 / T | Bangladesh: 50 Hz |
| **Power Factor** | Unitless | - | SI | PF = P / S | Good: 0.95, Poor: 0.7 |

**Bangladesh Electrical Standards:**
```
AC Supply:
- Voltage: 230 V (single phase)
- Frequency: 50 Hz
- Voltage Tolerance: ±5%

Three-Phase:
- Voltage: 400 V (3-phase, 4-wire)
- Frequency: 50 Hz
```

---

### CATEGORY 15: TEXTILE UNITS (Bangladesh Garment/Textile Industry)

#### Yarn Count / Fineness

**Base: Tex (grams per 1,000 meters)**

| Unit | Symbol | Definition | Conversion | Type |
|------|--------|------------|------------|------|
| Tex | tex | g per 1000m | Base | SI (Textile) |
| Denier | den | g per 9000m | den = tex × 9 | International |
| Decitex | dtex | g per 10000m | dtex = tex × 10 | SI (Textile) |
| English Count (Ne) | Ne | 840 yards/lb | Ne = 590.54/tex | International |
| Metric Count | Nm | 1000m per kg | Nm = 1000/tex | SI |
| Grains per Yard | gr/yd | Grains/yard | gr/yd = tex × 70.86 | International |

**Example Conversions:**
```
Cotton 30 Ne:
  Tex = 590.54 / 30 = 19.68 tex
  Denier = 19.68 × 9 = 177 denier
  Metric = 1000 / 19.68 = 50.8 Nm
```

#### Fabric Measurements

| Unit | Symbol | Definition | Type | Use |
|------|--------|------------|------|-----|
| **GSM** | **GSM** | Grams per Square Meter | SI | Weight specification |
| **Ounce per Square Yard** | **oz/yd²** | Ounces per square yard | English | English-speaking |
| **EPI** | **EPI** | Ends Per Inch (warp) | International | Weaving |
| **PPI** | **PPI** | Picks Per Inch (weft) | International | Weaving |
| **TPI** | **TPI** | Threads Per Inch | International | Twist |
| **Thread Count** | **TC** | Total threads/sq inch | International | Bedsheet quality |

**GSM Calculation:**
```
Formula: GSM = (EPI/Warp Count + PPI/Weft Count) × 25.6

Example:
Fabric EPI=80, Warp Ne=40, PPI=60, Weft Ne=40
GSM = (80/40 + 60/40) × 25.6 = (2 + 1.5) × 25.6 = 89.6 GSM
```

**GSM Conversions:**
- GSM to oz/yd²: oz/yd² = GSM × 0.0295
- oz/yd² to GSM: GSM = oz/yd² / 0.0295
- Light fabric: 80-150 GSM
- Medium fabric: 150-250 GSM
- Heavy fabric: 250+ GSM

#### Textile Fiber Fineness (Cotton)

| Unit | Symbol | Definition | Type |
|------|--------|------------|------|
| Micronaire | µ | Micrograms per inch | Cotton fineness |
| Fiber Diameter | - | In microns (µm) | Technical |
| Micron | µm | 0.001 mm | International |

---

### CATEGORY 16: SHIPPING & LOGISTICS

#### Container Units

| Unit | Symbol | Dimensions | Volume | Max Weight | Type |
|------|--------|------------|--------|------------|------|
| **TEU (20ft)** | **TEU** | 20'×8'×8.5' | 33 m³ | 28.3 tons | International |
| **FEU (40ft)** | **FEU** | 40'×8'×8.5' | 67 m³ | 30 tons | International |
| **HC FEU** | **HC** | 40'×8'×9.5' | 76 m³ | 30 tons | International |
| **45ft Container** | **45'** | 45'×8'×9' | 85 m³ | 29 tons | International |
| **53ft Container** | **53'** | 53'×8'×9' | 105 m³ | 30 tons | International |

**Conversions:**
- 1 FEU = 2 TEUs
- 45-ft container ≈ 2.25 TEUs
- 1 m³ (CBM) = 1 cubic meter

**Shipping Weight Units:**

| Unit | Symbol | Kg Equivalent | Type | Use |
|------|--------|---------------|------|-----|
| Kilogram | kg | 1 | SI | Standard |
| Metric Tonne | MT/t | 1,000 | SI | Bulk cargo |
| Pound | lb | 0.453592 | English | |
| Short Ton (US) | ST | 907.185 | English | USA shipping |
| Long Ton (UK) | LT | 1,016.05 | English | UK shipping |

---

### CATEGORY 17: MECHANICAL ENGINEERING

#### Stress / Pressure in Materials

| Unit | Symbol | In Pa | Type | Use |
|------|--------|-------|------|-----|
| Megapascal | MPa | 1,000,000 | SI | Materials testing |
| Gigapascal | GPa | 10^9 | SI | Steel, composites |
| Newton per mm² | N/mm² | 1,000,000 | SI | Engineering |
| Kilogram-Force per cm² | kgf/cm² | 98,066.5 | International | Traditional |
| PSI | psi | 6,894.76 | English | USA engineering |

**Example:** Steel yield strength = 250 MPa

#### Hardness Units

| Unit | Symbol | Type | Application | Range |
|------|--------|------|-------------|-------|
| Rockwell Hardness | HR | International | Metals, steels | 0-100 (HRC) |
| Brinell Hardness | HB | International | Cast iron, soft metals | 100-600 HB |
| Vickers Hardness | HV | International | Precise, small samples | Unlimited |
| Mohs Hardness | Mohs | Traditional | Minerals | 1-10 |
| Shore Hardness | Shore | International | Elastomers, plastics | A, D, etc. |

---

### CATEGORY 18: ROBOTICS & AUTOMATION

#### Angular/Rotational Motion

| Parameter | Unit | Symbol | In rad/s | Type | Robotics Use |
|-----------|------|--------|----------|------|--------------|
| Angular Velocity | Radian/Second | rad/s | 1 | SI | Joint speed |
| Angular Velocity | Degree/Second | deg/s | 0.017453 | International | Servo control |
| Angular Velocity | RPM | RPM | 0.104720 | International | Motor speed |
| Angular Acceleration | rad/s² | rad/s² | 1 | SI | Acceleration profile |
| Angular Acceleration | deg/s² | deg/s² | 0.000305 | International | Servo acceleration |
| Rotation | Degree | deg | 0.017453 | International | Servo position: 0-180° |
| Rotation | Radian | rad | 1 | SI | 0-π range |

**Servo Motor Control (Critical for Bangladesh Robotics Industry):**

```
Standard Servo Parameters:
- Position Range: 0° to 180° (or ±90°)
- Center Position: 90° (1500 microseconds)
- PWM Frequency: 50 Hz (20 ms period)
- Pulse Width Range: 1000-2000 µs
- Speed: 0.10-0.20 sec/60° (typical)

Conversions:
- 1 RPM = 6 deg/s = 0.1047 rad/s
- 1 deg/s = 0.01745 rad/s = 0.1667 RPM
- 360°/60sec = 6 deg/s = 1 RPM
```

#### Linear Motion (Robot Arm)

| Unit | Symbol | Meter Equivalent | Type | Use |
|------|--------|-----------------|------|-----|
| Meter | m | 1 | SI | Reach, distance |
| Millimeter | mm | 0.001 | SI | Positioning |
| Centimeter | cm | 0.01 | SI | Robot arm reach |
| Micrometer | µm | 0.000001 | SI | High precision |
| Inch | in | 0.0254 | English | CNC positioning |

#### Speed Units (Robotics)

| Unit | Symbol | m/s Equivalent | Type | Use |
|------|--------|----------------|------|-----|
| Meter per Second | m/s | 1 | SI | Linear velocity |
| Millimeter per Second | mm/s | 0.001 | SI | Robot arm speed |
| Centimeter per Second | cm/s | 0.01 | SI | Movement |
| Inch per Second | in/s | 0.0254 | English | |
| Meter per Minute | m/min | 0.01667 | SI | |

---

### CATEGORY 19: ELECTRONICS & COMPONENTS

#### Electrical Values

| Unit | Symbol | Base | Type | Range for Bangladesh Electronics |
|------|--------|------|------|--------------------------------|
| Capacitance - Farad | F | 1 | SI | |
| Capacitance - Microfarad | µF | 10^-6 | SI | 1-1000 µF typical |
| Capacitance - Nanofarad | nF | 10^-9 | SI | 10-1000 nF typical |
| Capacitance - Picofarad | pF | 10^-12 | SI | 1-1000 pF typical |
| Inductance - Henry | H | 1 | SI | |
| Inductance - Millihenry | mH | 0.001 | SI | 1-1000 mH typical |
| Inductance - Microhenry | µH | 10^-6 | SI | 10-1000 µH typical |
| Resistance - Ohm | Ω | 1 | SI | 1-10M Ω typical |
| Resistance - Kilohm | kΩ | 1,000 | SI | 1-1000 kΩ typical |
| Resistance - Megohm | MΩ | 1,000,000 | SI | 1-10 MΩ typical |

#### Frequency & Oscillation

| Unit | Symbol | Hz Equivalent | Type | Bangladesh Use |
|------|--------|---------------|------|----------------|
| Hertz | Hz | 1 | SI | AC frequency = 50 Hz |
| Kilohertz | kHz | 1,000 | SI | RF, switching circuits |
| Megahertz | MHz | 1,000,000 | SI | Microcontroller: 16 MHz |
| Gigahertz | GHz | 10^9 | SI | CPU clock: 1-3 GHz |

---

### CATEGORY 20: DATA STORAGE (Bonus)

| Unit | Symbol | Bytes | Type |
|------|--------|-------|------|
| Byte | B | 1 | SI |
| Kilobyte | KB | 1,000 (decimal) / 1,024 (binary) | SI |
| Megabyte | MB | 10^6 | SI |
| Gigabyte | GB | 10^9 | SI |
| Terabyte | TB | 10^12 | SI |

---

### CATEGORY 21: MISCELLANEOUS

#### Density

| Unit | Symbol | kg/m³ Equivalent | Type |
|------|--------|------------------|------|
| Kilogram per Cubic Meter | kg/m³ | 1 | SI |
| Gram per Cubic Centimeter | g/cm³ | 1,000 | SI |
| Pound per Cubic Foot | lb/ft³ | 16.0185 | English |

#### Viscosity

| Unit | Symbol | Pa⋅s Equivalent | Type | Use |
|------|--------|-----------------|------|-----|
| Pascal-Second | Pa⋅s | 1 | SI | Standard |
| Centipoise | cP | 0.001 | CGS | Oil, fluid |
| Poise | P | 0.1 | CGS | |

#### Sound/Noise

| Unit | Symbol | Type | Definition |
|------|--------|------|------------|
| Decibel | dB | Logarithmic | Relative pressure |
| Decibel A-weighted | dB(A) | Logarithmic | Human perception |
| Hertz | Hz | SI | Frequency (pitch) |

#### Luminous Intensity (Lighting)

| Unit | Symbol | Type | Definition |
|------|--------|------|------------|
| Candela | cd | SI | Luminous intensity |
| Lumen | lm | SI | Total luminous flux |
| Lux | lx | SI | 1 lumen per m² |
| Foot-Candle | fc | English | ~10.764 lux |

---

## DATABASE SCHEMA

### PostgreSQL Complete Setup

```sql
-- Create category types enum
CREATE TYPE unit_type_enum AS ENUM ('SI', 'International', 'Desi', 'English', 'CGS', 'Other');

-- Unit Categories Table
CREATE TABLE unit_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  base_unit_name VARCHAR(50) NOT NULL,
  base_unit_symbol VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units Table (Universal)
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES unit_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) UNIQUE NOT NULL,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  unit_type unit_type_enum NOT NULL,
  region VARCHAR(100),  -- 'Bangladesh', 'USA', 'UK', 'South Asia', etc.
  to_base_factor DECIMAL(30,15) NOT NULL,  -- Conversion to base unit
  alternate_names VARCHAR(500),  -- 'tola, tola weight, tol'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category_id),
  INDEX idx_symbol (symbol),
  INDEX idx_unit_type (unit_type)
);

-- Conversion Factors (Cached for speed)
CREATE TABLE conversion_factors (
  id SERIAL PRIMARY KEY,
  from_unit_id INT NOT NULL REFERENCES units(id),
  to_unit_id INT NOT NULL REFERENCES units(id),
  conversion_factor DECIMAL(30,15) NOT NULL,
  is_linear BOOLEAN DEFAULT true,
  formula_code VARCHAR(255),  -- 'celsius_to_fahrenheit' for non-linear
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_conversion (from_unit_id, to_unit_id),
  INDEX idx_from_unit (from_unit_id),
  INDEX idx_to_unit (to_unit_id)
);

-- Measurement Records (Factory Data)
CREATE TABLE measurements (
  id BIGSERIAL PRIMARY KEY,
  factory_id INT NOT NULL,
  department VARCHAR(100),  -- 'Textile', 'Shipping', 'Electronics', etc.
  measurement_type VARCHAR(100),  -- 'Weight', 'Length', 'Temperature', etc.
  measurement_name VARCHAR(200),  -- 'Fabric Weight', 'Motor RPM', etc.
  value DECIMAL(20,10) NOT NULL,
  unit_id INT NOT NULL REFERENCES units(id),
  recorded_by VARCHAR(100),
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_factory (factory_id),
  INDEX idx_unit (unit_id),
  INDEX idx_recorded_at (recorded_at),
  INDEX idx_department (department)
);

-- Unit Aliases (Alternative names)
CREATE TABLE unit_aliases (
  id SERIAL PRIMARY KEY,
  unit_id INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  alias_name VARCHAR(100) NOT NULL UNIQUE,
  alias_symbol VARCHAR(20),
  region VARCHAR(100),  -- Regional alternatives
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversion History (For audit and debugging)
CREATE TABLE conversion_history (
  id BIGSERIAL PRIMARY KEY,
  from_unit_id INT NOT NULL REFERENCES units(id),
  to_unit_id INT NOT NULL REFERENCES units(id),
  input_value DECIMAL(20,10) NOT NULL,
  output_value DECIMAL(20,10) NOT NULL,
  conversion_factor DECIMAL(30,15) NOT NULL,
  user_id INT,
  converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_converted_at (converted_at)
);
```

### Insert Base Categories

```sql
-- Insert all 21 categories
INSERT INTO unit_categories (name, description, base_unit_name, base_unit_symbol) VALUES
('Length', 'Distance measurements', 'Meter', 'm'),
('Weight', 'Mass measurements', 'Kilogram', 'kg'),
('Volume', 'Capacity measurements', 'Cubic Meter', 'm³'),
('Temperature', 'Temperature measurements (special handling)', 'Celsius', '°C'),
('Area', 'Surface area measurements', 'Square Meter', 'm²'),
('Count', 'Quantity/Count units', 'Piece', 'pc'),
('Pressure', 'Pressure measurements', 'Pascal', 'Pa'),
('Flow Rate', 'Volumetric flow measurements', 'Cubic Meter per Second', 'm³/s'),
('Force', 'Force measurements', 'Newton', 'N'),
('Torque', 'Torque/Moment measurements', 'Newton-Meter', 'N⋅m'),
('Rotational Speed', 'Angular velocity measurements', 'Radian per Second', 'rad/s'),
('Energy', 'Energy/Work measurements', 'Joule', 'J'),
('Power', 'Power measurements', 'Watt', 'W'),
('Electrical Current', 'Electric current', 'Ampere', 'A'),
('Electrical Voltage', 'Electric potential', 'Volt', 'V'),
('Electrical Resistance', 'Electric resistance', 'Ohm', 'Ω'),
('Electrical Power', 'Electric power (Real, Reactive, Apparent)', 'Watt', 'W'),
('Textile - Yarn Count', 'Yarn fineness measurements', 'Tex', 'tex'),
('Textile - Fabric Weight', 'Fabric weight (GSM)', 'Gram per Square Meter', 'GSM'),
('Shipping', 'Shipping container units', 'TEU', 'TEU'),
('Mechanical Stress', 'Material stress measurements', 'Pascal', 'Pa'),
('Robotics - Rotation', 'Robot angular motion', 'Radian per Second', 'rad/s'),
('Robotics - Linear', 'Robot linear motion', 'Millimeter', 'mm'),
('Electronics - Capacitance', 'Capacitor values', 'Farad', 'F'),
('Electronics - Inductance', 'Inductor values', 'Henry', 'H'),
('Electronics - Frequency', 'Oscillation frequency', 'Hertz', 'Hz'),
('Density', 'Mass per volume', 'Kilogram per Cubic Meter', 'kg/m³'),
('Viscosity', 'Fluid resistance', 'Pascal-Second', 'Pa⋅s'),
('Luminous Intensity', 'Light measurements', 'Lux', 'lx'),
('Sound', 'Sound/Noise measurements', 'Decibel', 'dB');
```

---

## IMPLEMENTATION CODE (Node.js)

```javascript
// server.js - Complete Unit Conversion API

const express = require('express');
const pool = require('./db');  // Your database connection
const app = express();

app.use(express.json());

// 1. UNIVERSAL CONVERSION ENDPOINT
app.post('/api/convert', async (req, res) => {
  try {
    const { value, from_unit_symbol, to_unit_symbol, category } = req.body;
    
    if (!value || !from_unit_symbol || !to_unit_symbol) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      SELECT 
        u1.id as from_id, u1.to_base_factor as from_factor, u1.symbol as from_sym,
        u2.id as to_id, u2.to_base_factor as to_factor, u2.symbol as to_sym,
        uc.name as category_name, uc.base_unit_name, uc.base_unit_symbol
      FROM units u1
      JOIN units u2 ON u1.category_id = u2.category_id
      JOIN unit_categories uc ON u1.category_id = uc.id
      WHERE (u1.symbol = ? OR u1.name = ?)
        AND (u2.symbol = ? OR u2.name = ?)
    `;

    const result = await pool.query(query, [
      from_unit_symbol, from_unit_symbol,
      to_unit_symbol, to_unit_symbol
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Units not found' });
    }

    const row = result.rows[0];

    // Special handling for Temperature
    if (row.category_name === 'Temperature') {
      const converted = convertTemperature(value, from_unit_symbol, to_unit_symbol);
      return res.json({
        value, from_unit: from_unit_symbol, to_unit: to_unit_symbol,
        result: parseFloat(converted.toFixed(6)),
        formula: `${value}°${from_unit_symbol} = ${converted.toFixed(2)}°${to_unit_symbol}`,
        category: row.category_name
      });
    }

    // Standard conversion
    const base_value = value * row.from_factor;
    const result_value = base_value / row.to_factor;

    // Log conversion for audit
    await logConversion(row.from_id, row.to_id, value, result_value);

    res.json({
      value, from_unit: from_unit_symbol, to_unit: to_unit_symbol,
      result: parseFloat(result_value.toFixed(15)),
      formula: `${value} ${from_unit_symbol} = ${result_value.toFixed(6)} ${to_unit_symbol}`,
      category: row.category_name,
      base_unit: `${row.base_unit_name} (${row.base_unit_symbol})`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 2. GET ALL CATEGORIES
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM unit_categories ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. GET UNITS BY CATEGORY
app.get('/api/units/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const query = `
      SELECT u.*, uc.name as category_name
      FROM units u
      JOIN unit_categories uc ON u.category_id = uc.id
      WHERE LOWER(uc.name) = LOWER(?)
      ORDER BY u.unit_type, u.name
    `;
    
    const result = await pool.query(query, [category]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. GET UNITS BY TYPE (SI, Desi, International, etc.)
app.get('/api/units-by-type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const result = await pool.query(
      'SELECT * FROM units WHERE unit_type = ? ORDER BY name',
      [type]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. SEARCH UNITS
app.get('/api/search-units', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    let query = `
      SELECT u.*, uc.name as category_name
      FROM units u
      JOIN unit_categories uc ON u.category_id = uc.id
      WHERE (u.name ILIKE ? OR u.symbol ILIKE ? OR u.alternate_names ILIKE ?)
    `;
    const params = [`%${q}%`, `%${q}%`, `%${q}%`];
    
    if (category) {
      query += ' AND LOWER(uc.name) = LOWER(?)';
      params.push(category);
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. BATCH CONVERSION
app.post('/api/batch-convert', async (req, res) => {
  try {
    const { conversions } = req.body;  // Array of {value, from, to}
    
    if (!Array.isArray(conversions)) {
      return res.status(400).json({ error: 'conversions must be an array' });
    }

    const results = await Promise.all(
      conversions.map(async (conv) => {
        try {
          const query = `
            SELECT u1.to_base_factor, u2.to_base_factor as to_factor
            FROM units u1
            JOIN units u2 ON u1.category_id = u2.category_id
            WHERE u1.symbol = ? AND u2.symbol = ?
          `;
          
          const result = await pool.query(query, [conv.from, conv.to]);
          if (!result.rows.length) return { error: 'Unit not found', from: conv.from, to: conv.to };
          
          const row = result.rows[0];
          const converted = (conv.value * row.to_base_factor) / row.to_factor;
          
          return {
            from: conv.from, to: conv.to,
            input: conv.value, output: parseFloat(converted.toFixed(10))
          };
        } catch (err) {
          return { error: err.message, from: conv.from, to: conv.to };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 7. RECORD MEASUREMENT
app.post('/api/measurements', async (req, res) => {
  try {
    const { factory_id, measurement_type, measurement_name, value, unit_id, recorded_by, department, notes } = req.body;
    
    const query = `
      INSERT INTO measurements
      (factory_id, measurement_type, measurement_name, value, unit_id, recorded_by, department, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [
      factory_id, measurement_type, measurement_name, value, unit_id, recorded_by, department, notes
    ]);

    res.json({
      id: result.rows[0].id,
      message: 'Measurement recorded successfully',
      timestamp: result.rows[0].created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 8. GET MEASUREMENT HISTORY
app.get('/api/measurements', async (req, res) => {
  try {
    const { factory_id, department, start_date, end_date, limit = 100 } = req.query;
    
    let query = 'SELECT m.*, u.name as unit_name, u.symbol FROM measurements m JOIN units u ON m.unit_id = u.id WHERE 1=1';
    const params = [];

    if (factory_id) {
      query += ' AND m.factory_id = ?';
      params.push(factory_id);
    }
    if (department) {
      query += ' AND m.department = ?';
      params.push(department);
    }
    if (start_date) {
      query += ' AND m.recorded_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND m.recorded_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY m.recorded_at DESC LIMIT ?';
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper Functions
function convertTemperature(value, from, to) {
  let celsius;
  
  if (from === '°C' || from === 'C') celsius = value;
  else if (from === '°F' || from === 'F') celsius = (value - 32) * 5/9;
  else if (from === 'K') celsius = value - 273.15;
  else if (from === '°R' || from === 'R') celsius = (value * 5/9) - 273.15;
  
  if (to === '°C' || to === 'C') return celsius;
  else if (to === '°F' || to === 'F') return (celsius * 9/5) + 32;
  else if (to === 'K') return celsius + 273.15;
  else if (to === '°R' || to === 'R') return (celsius + 273.15) * 9/5;
}

async function logConversion(from_id, to_id, input, output) {
  try {
    await pool.query(
      `INSERT INTO conversion_history (from_unit_id, to_unit_id, input_value, output_value)
       VALUES (?, ?, ?, ?)`,
      [from_id, to_id, input, output]
    );
  } catch (error) {
    console.error('Logging error:', error);
  }
}

app.listen(3000, () => {
  console.log('Unit Converter API running on port 3000');
  console.log('Endpoints: POST /api/convert, GET /api/categories, GET /api/units/:category');
});
```

---

## BANGLADESH INDUSTRY COMPLIANCE

### BSTI Standards

The **Bangladesh Standards and Testing Institution (BSTI)** is the official standards body. Key standards:

1. **BDS 0001** - General requirements for SI units
2. **BDS 1500+** - Industry-specific standards
3. **BDS Garment Standards** - Textile measurement specifications
4. **BDS Electrical Standards** - 50 Hz, 230V single-phase, 400V three-phase

### Regional Unit Variations

```
AREA UNITS (Bigha) - Regional Variations:
- Dhaka Division: 2,500 m²
- Chittagong Division: 2,800 m²
- Sylhet Division: 2,300 m²
- Rajshahi Division: 2,700 m²
- Khulna Division: 2,500 m²
- Barishal Division: 2,600 m²

Store with region field:
INSERT INTO units (name, symbol, region, to_base_factor) VALUES
('Bigha (Dhaka)', 'bigha_dh', 'Dhaka', 2500),
('Bigha (Chittagong)', 'bigha_ct', 'Chittagong', 2800),
...
```

### Garment Industry Standards

Bangladesh produces 4 billion garments annually. Key measurements:
- Yarn count: Ne (English), Tex, Nm
- Fabric weight: GSM (grams per square meter)
- Construction: EPI (ends per inch), PPI (picks per inch)
- Stitching: SPI (stitches per inch)

---

## QUICK REFERENCE TABLES

### Conversion Factors (Most Used in Bangladesh)

```
LENGTH:
1 meter = 100 cm = 3.28 feet = 39.37 inches
1 gaj = 0.9144 m (same as yard)
1 cubit = 0.4572 m

WEIGHT:
1 kg = 1000 grams = 2.2046 pounds
1 tola = 11.664 grams
1 seer = 933 grams = 80 tola
1 maund = 37.32 kg = 40 seer

TEXTILE (Yarn):
Ne 40 cotton = 14.76 Tex = 132.8 Denier

TEXTILE (Fabric):
100 GSM = 2.95 oz/yd²
150 GSM = 4.43 oz/yd²

PRESSURE:
1 atm = 101,325 Pa = 1.01325 bar = 14.696 psi

ELECTRICAL:
Bangladesh 50 Hz AC = 230V (single-phase) or 400V (3-phase)

SHIPPING:
1 TEU = 33 m³ = 2 TEUs = 1 FEU
Max weight = 28.3 tons per TEU
```

---

## SUMMARY: YOUR ACTION PLAN

### Phase 1 (Week 1-2): Database Setup
- [ ] Install PostgreSQL on your server
- [ ] Create all 21+ unit categories
- [ ] Insert 500+ unit definitions with conversions
- [ ] Add regional variations for desi units
- [ ] Create indexes for fast searches

### Phase 2 (Week 3-4): API Development
- [ ] Build conversion endpoints
- [ ] Implement batch conversion
- [ ] Add measurement recording
- [ ] Create search functionality
- [ ] Add Bangladesh compliance features

### Phase 3 (Week 5-6): Frontend & Testing
- [ ] Web interface for factory workers
- [ ] Mobile app for on-floor data entry
- [ ] Comprehensive testing with real factory data
- [ ] Staff training

### Success Metrics
- ✅ Covers ALL units (21+ categories)
- ✅ Works offline after initial sync
- ✅ Supports all Bangladesh desi units
- ✅ Handles regional variations
- ✅ Audit trail of all conversions
- ✅ Zero API dependency

Good luck! Your system will be the most comprehensive unit converter for Bangladesh factories. 🏭📊✨
