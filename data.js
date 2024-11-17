const productDatabase = {
    footwear: [
        { name: "SAFETOE M8027", price: 3500.00 },
        { name: "BOVA 90004", price: 9900.00 },
        { name: "CHELSEA 90006", price: 15000.00 },
        { name: "DAKAR", price: 8000.00 },
        { name: "SAFETY STAR", price: 3500.00 },
        { name: "BESTBOY", price: 4500.00 },
        { name: "BESTRUN", price: 4300.00 },
        { name: "SAFETOE BESTRUN", price: 3300.00 },
        { name: "LIGERO", price: 11450.00 },
        { name: "MANAGER", price: 8995.00 },
        { name: "DENVER", price: 5500.00 },
        { name: "GOLIATH CL69", price: 9800.00 },
        { name: "GOLIATH CL603", price: 11750.00 },
        { name: "DOLCE", price: 7400.00 },
        { name: "BESTGIRL", price: 5650.00 },
        { name: "SISI 51002", price: 8400.00 },
        { name: "SISI 51003", price: 8200.00 },
        { name: "X1110", price: 6750.00 },
        { name: "X2020P", price: 6850.00 },
        { name: "X1110EH", price: 7400.00 },
        { name: "BESTLIGHT", price: 2700.00 },
        { name: "SONIC", price: 3100.00 },
        { name: "REMY", price: 5800.00 },
        { name: "ELIZA", price: 4450.00 },
        { name: "HILL SAFETY BOOT", price: 3300.00 }
    ],
    gumboots: [
        { name: "POSEIDON WHITE GUMBOOTS", price: 3200.00 },
        { name: "HERCULES BLACK SAFETY GUMBOOTS", price: 3050.00 }
    ],
    helmets: [
        { name: "AMERIZA WITHOUT CHIN STRAP", price: 700.00 },
        { name: "QUARTZ 1 WITHOUT CHIN STRAP", price: 800.00 },
        { name: "QUARTZ IV WITHOUT CHIN STRAP", price: 950.00 },
        { name: "JSP EVO2 WITHOUT CHIN STRAP", price: 1085.00 },
        { name: "ORDINARY CHIN STRAP", price: 80.00 },
        { name: "FOUR POINT CHIN STRAP DELTA", price: 670.00 },
        { name: "ORDINARY CHIN STRAP DELTA", price: 170.00 },
        { name: "CRUSH HELMET LEIDEN", price: 2800.00 },
        { name: "GRANITE WIND WORK AT HEIGHT", price: 4200.00 },
        { name: "FORESTIER2 FACESHIELD AND EAR MUFFS", price: 3700.00 }
    ],
    bumpcaps: [
        { name: "DELTA AIR COLTAN FLUORESCENT YELLOW - GREY", price: 1880.00 },
        { name: "DELTA AIR COLTAN BLACK-RED", price: 1880.00 },
        { name: "JSP BLACK/ORANGE", price: 3950.00 }
    ],
    gloves: [
        { name: "RIDING GLOVES", price: 1800.00 },
        { name: "DELTA NITRILE VE801", price: 350.00 },
        { name: "DELTA VE730 DIAMOND GRIP", price: 350.00 },
        { name: "DELTA DUO/BIO COLOR", price: 130.00 },
        { name: "DELTA WELDING GLOVE CA515", price: 955.00 },
        { name: "DELTA POLKA DOTTED GLOVES TP169", price: 110.00 },
        { name: "VENICUT 43 CUT RESISTANT", price: 615.00 },
        { name: "SHIELD CUT RESISTANT SAFETY JOGGER", price: 580.00 },
        { name: "DELTA MECHANICAL VE727", price: 670.00 },
        { name: "PVC GLOVES DELTA PVC7335 LENGTH 350MM", price: 350.00 },
        { name: "WONDERGRIP WG318 AQUA", price: 765.00 },
        { name: "WONDERGRIP WG338 THERMO PLUS", price: 1370.00 },
        { name: "WONDERGRIP WG518W OIL PLUS", price: 860.00 }
    ],
    respiratory: [
        { name: "DELTA M1200VWC", price: 205.00 },
        { name: "DELTA M1200C", price: 90.00 },
        { name: "DELTA HALF FACE MASK M6200", price: 1500.00 },
        { name: "DELTA CARTRIDGE M6000", price: 2500.00 },
        { name: "DELTA FULL FACE MASK 9200", price: 20900.00 },
        { name: "DELTA CARTRIDGE M9000", price: 4800.00 },
        { name: "3M HALF FACE MASK 6300", price: 2860.00 },
        { name: "3M CARTRIDGE 6006", price: 2860.00 },
        { name: "3M FULL FACE MASK 6800", price: 19000.00 }
    ],
    earprotection: [
        { name: "DELTA INTERLAGOS", price: 1980.00 },
        { name: "DELTA SPA3", price: 660.00 },
        { name: "DELTA INTERLAGOS LIGHT HE", price: 1385.00 },
        { name: "DELTA EAR PLUGS RE-USABLE CONICFIT100", price: 60.00 }
    ],
    eyewear: [
        { name: "DELTA CLEAR LIPARI GLASSES", price: 610.00 },
        { name: "DELTA KILIMANJARO GLASSES", price: 400.00 },
        { name: "DELTA VULCANO GLASSES", price: 600.00 },
        { name: "DELTA BRAVA2 GLASSES", price: 350.00 },
        { name: "DELTA PITON CLEAR GLASSES", price: 350.00 },
        { name: "FUEGO CLEAR HELMET ATTACHABLE GLASSES", price: 600.00 },
        { name: "DELTA GALERAS GOGGLES", price: 720.00 },
        { name: "DELTA SAJAMA GOGGLES", price: 1550.00 }
    ],
    firefighting: [
        { name: "FIRE GLOVES VIKING", price: 13500.00 },
        { name: "FIRE HOOD VIKING", price: 8500.00 },
        { name: "FIRE SUIT NFPA UNIPROTEC", price: 230000.00 },
        { name: "FIRE BOOT HARVIK RUBBER", price: 25200.00 },
        { name: "AXE AND POUCH", price: 10800.00 },
        { name: "FIRE HELMET BULLARD", price: 47000.00 }
    ],
    others: [
        { name: "SHELL WATER DETECTORS", price: 15100.00 },
        { name: "GREAT COATS", price: 8200.00 },
        { name: "DELTA PVC APRON", price: 760.00 },
        { name: "DELTA RAIN SUITS YELLOW", price: 2850.00 },
        { name: "DELTA RAIN SUITS NAVY BLUE", price: 2200.00 }
    ],
    hivis: [
        { name: "LEO ANTISTATIC", price: 2500.00 },
        { name: "ZEO ANTISTATIC", price: 1350.00 },
        { name: "ZEO COOLVIS", price: 800.00 },
        { name: "ZEO ORDINARY VEST", price: 400.00 },
        { name: "ZEO STORM JACKET", price: 5200.00 }
    ]
};

window.productDatabase = productDatabase;