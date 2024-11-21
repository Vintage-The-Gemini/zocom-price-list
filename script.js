// Initialize jsPDF
window.jsPDF = window.jspdf.jsPDF;
let rowCounter = 0;

// Helper function for currency formatting
function formatCurrency(amount) {
    return `KES ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Initialize document buttons
function initializeButtons() {
    const addButton = document.createElement('button');
    addButton.className = 'add-product-btn';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Add Product';
    addButton.onclick = addProductRow;

    const calculateButton = document.createElement('button');
    calculateButton.className = 'calculate-btn';
    calculateButton.innerHTML = '<i class="fas fa-calculator"></i> Calculate Total';
    calculateButton.onclick = calculateTotals;

    const downloadButton = document.createElement('button');
    downloadButton.className = 'download-pdf-btn';
    downloadButton.innerHTML = '<i class="fas fa-file-pdf"></i> Download Quotation';
    downloadButton.onclick = generateQuotationPDF;

   

    const pdfContainer = document.querySelector('.pdf-button-container');
    pdfContainer.appendChild(downloadButton);
}

// Function to add a product row
function addProductRow() {
    const container = document.getElementById('products-container');
    const row = createProductRow();
    container.appendChild(row);
    rowCounter++;
}

// Function to create a product row
function createProductRow() {
    const row = document.createElement('div');
    row.className = 'product-row';
    row.id = `product-row-${rowCounter}`;

    row.innerHTML = `
        <div class="input-group">
            <label><i class="fas fa-tags"></i> Product Type</label>
            <select onchange="toggleProductType(${rowCounter})" id="product-type-${rowCounter}">
                <option value="catalog">Catalog Product</option>
                <option value="custom">Custom Product</option>
            </select>
        </div>
        
        <div id="catalog-inputs-${rowCounter}" class="catalog-inputs">
            <div class="input-group">
                <label><i class="fas fa-list"></i> Category</label>
                <select onchange="updateEquipmentList(${rowCounter})" id="category-${rowCounter}">
                    <option value="">-- Select Category --</option>
                    ${Object.keys(productDatabase).map(category => {
                        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                        return `<option value="${category}">${formattedCategory}</option>`;
                    }).join('')}
                </select>
            </div>
            <div class="input-group">
                <label><i class="fas fa-shopping-cart"></i> Product</label>
                <select id="equipment-${rowCounter}" class="equipment-select" onchange="handleProductSelect(${rowCounter})">
                    <option value="">-- Select Product --</option>
                </select>
            </div>
        </div>
        
        <div id="custom-inputs-${rowCounter}" class="custom-inputs" style="display: none;">
            <div class="input-group">
                <label><i class="fas fa-pen"></i> Custom Product Name</label>
                <input type="text" id="custom-name-${rowCounter}" placeholder="Enter product name">
            </div>
        </div>
        
        <div class="input-group price-input">
            <label><i class="fas fa-tag"></i> Price (KES)</label>
            <input type="number" id="price-${rowCounter}" min="0" step="0.01" placeholder="Enter price">
        </div>
        
        <div class="input-group quantity">
            <label><i class="fas fa-hashtag"></i> Quantity</label>
            <input type="number" id="quantity-${rowCounter}" min="1" value="1">
        </div>
        
        <div class="input-group discount-section">
            <label><i class="fas fa-percent"></i> Discount</label>
            <select id="discount-type-${rowCounter}" onchange="updateDiscount(${rowCounter})">
                <option value="">No Discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (KES)</option>
            </select>
            <input type="number" id="discount-value-${rowCounter}" min="0" step="0.01" 
                   placeholder="Discount value" style="display: none;">
        </div>
        
        <button onclick="removeProductRow(${rowCounter})" class="remove-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return row;
}

// Function to toggle between custom and catalog product
function toggleProductType(rowId) {
    const productType = document.getElementById(`product-type-${rowId}`).value;
    const catalogInputs = document.getElementById(`catalog-inputs-${rowId}`);
    const customInputs = document.getElementById(`custom-inputs-${rowId}`);
    const priceInput = document.getElementById(`price-${rowId}`);

    if (productType === 'custom') {
        catalogInputs.style.display = 'none';
        customInputs.style.display = 'block';
        priceInput.readOnly = false;
        priceInput.value = '';
    } else {
        catalogInputs.style.display = 'block';
        customInputs.style.display = 'none';
        priceInput.readOnly = true;
    }
}

// Function to handle product selection and price update
function handleProductSelect(rowId) {
    const equipmentSelect = document.getElementById(`equipment-${rowId}`);
    const priceInput = document.getElementById(`price-${rowId}`);
    
    if (equipmentSelect.value) {
        const [name, price] = equipmentSelect.value.split('|');
        priceInput.value = price;
    } else {
        priceInput.value = '';
    }
    
    updateDiscount(rowId);
}

// Function to update equipment list based on selected category
function updateEquipmentList(rowId) {
    const categorySelect = document.getElementById(`category-${rowId}`);
    const equipmentSelect = document.getElementById(`equipment-${rowId}`);
    const selectedCategory = categorySelect.value;

    equipmentSelect.innerHTML = '<option value="">-- Select Product --</option>';

    if (!selectedCategory) return;

    const products = productDatabase[selectedCategory];
    if (products) {
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = `${product.name}|${product.price}`;
            option.textContent = `${product.name} - KES ${product.price.toFixed(2)}`;
            equipmentSelect.appendChild(option);
        });
    }
}

// Function to remove a product row
function removeProductRow(id) {
    document.getElementById(`product-row-${id}`).remove();
    calculateTotals();
}

// Function to update discount display and calculations
function updateDiscount(rowId) {
    const discountType = document.getElementById(`discount-type-${rowId}`).value;
    const discountValueInput = document.getElementById(`discount-value-${rowId}`);
    
    discountValueInput.style.display = discountType ? 'block' : 'none';
    
    if (!discountType) {
        discountValueInput.value = '';
    }
    
    calculateTotals();
}

// Calculate totals function
function calculateTotals() {
    const productSummary = document.getElementById('product-summary');
    productSummary.innerHTML = '';
    
    let grandSubtotal = 0;
    let grandVat = 0;
    let totalDiscount = 0;

    for (let i = 0; i < rowCounter; i++) {
        const row = document.getElementById(`product-row-${i}`);
        if (!row) continue;

        const productType = document.getElementById(`product-type-${i}`)?.value;
        const priceInput = document.getElementById(`price-${i}`);
        const quantityInput = document.getElementById(`quantity-${i}`);
        const discountType = document.getElementById(`discount-type-${i}`)?.value;
        const discountValue = document.getElementById(`discount-value-${i}`)?.value;

        if (!priceInput?.value || !quantityInput?.value) continue;

        const basePrice = parseFloat(priceInput.value);
        const quantity = parseInt(quantityInput.value);
        
        // Calculate discount
        let discountAmount = 0;
        if (discountType && discountValue) {
            if (discountType === 'percentage') {
                discountAmount = (basePrice * parseFloat(discountValue) / 100) * quantity;
            } else if (discountType === 'fixed') {
                discountAmount = parseFloat(discountValue) * quantity;
            }
        }

        const subtotal = (basePrice * quantity) - discountAmount;
        const vat = subtotal * 0.16;
        const total = subtotal + vat;

        grandSubtotal += subtotal;
        grandVat += vat;
        totalDiscount += discountAmount;

        // Get product name
        let productName = '';
        if (productType === 'custom') {
            productName = document.getElementById(`custom-name-${i}`).value || 'Custom Product';
        } else {
            const equipmentSelect = document.getElementById(`equipment-${i}`);
            productName = equipmentSelect.value ? equipmentSelect.value.split('|')[0] : '';
        }

        // Add to summary
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <div class="item-details">
                <span class="item-name">${productName}</span>
                <span class="item-quantity">× ${quantity}</span>
                ${discountAmount > 0 ? `<span class="item-discount">Discount: KES ${discountAmount.toFixed(2)}</span>` : ''}
            </div>
            <div class="item-prices">
                <div>Subtotal: ${formatCurrency(subtotal)}</div>
                <div>VAT: ${formatCurrency(vat)}</div>
                <div>Total: ${formatCurrency(total)}</div>
            </div>
        `;
        productSummary.appendChild(summaryItem);
    }

    const grandTotal = grandSubtotal + grandVat;

    document.getElementById('grand-subtotal').textContent = formatCurrency(grandSubtotal);
    document.getElementById('grand-vat').textContent = formatCurrency(grandVat);
    document.getElementById('grand-total').textContent = formatCurrency(grandTotal);
    
    if (totalDiscount > 0) {
        const discountInfo = document.createElement('div');
        discountInfo.className = 'total-discount-info';
        discountInfo.textContent = `Total Savings: ${formatCurrency(totalDiscount)}`;
        productSummary.appendChild(discountInfo);
    }

    document.getElementById('result').classList.add('visible');
}

// Customer Profile Management Functions
function showProfilesModal() {
    const profiles = JSON.parse(localStorage.getItem('customerProfiles') || '[]');
    
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
        <div class="history-content">
            <h2>Customer Profiles</h2>
            <div class="profile-list">
                ${profiles.map(profile => `
                    <div class="history-item" onclick="loadCustomerProfile('${profile.id}')">
                        <div class="history-header">
                            <span>${profile.name}</span>
                            <span>${new Date(profile.savedDate).toLocaleDateString()}</span>
                        </div>
                        <div class="history-details">
                            <p>Email: ${profile.email}</p>
                            <p>Phone: ${profile.phone}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function loadCustomerProfile(profileId) {
    const profiles = JSON.parse(localStorage.getItem('customerProfiles') || '[]');
    const profile = profiles.find(p => p.id === profileId);
    
    if (profile) {
        document.getElementById('customer-name').value = profile.name;
        document.getElementById('customer-email').value = profile.email;
        document.getElementById('customer-phone').value = profile.phone;
        
        document.querySelector('.history-modal').remove();
        showNotification('Customer profile loaded successfully', 'success');
    }
}

// Quotation History Functions
function loadQuotation(quotationId) {
    const history = JSON.parse(localStorage.getItem('quotationHistory') || '[]');
    const quotation = history.find(q => q.id === quotationId);
    
    if (quotation) {
        // Load customer details
        document.getElementById('customer-name').value = quotation.customer.name;
        document.getElementById('customer-email').value = quotation.customer.email;
        document.getElementById('customer-phone').value = quotation.customer.phone;
        
        // Clear existing products
        document.getElementById('products-container').innerHTML = '';
        rowCounter = 0;
        
        // Load products
        quotation.products.forEach(product => {
            const row = createProductRow();
            document.getElementById('products-container').appendChild(row);
            
            const rowId = rowCounter - 1;
            if (product.category) {
                document.getElementById(`product-type-${rowId}`).value = 'catalog';
                document.getElementById(`category-${rowId}`).value = product.category;
                updateEquipmentList(rowId);
                document.getElementById(`equipment-${rowId}`).value = `${product.name}|${product.price}`;
            } else {
                document.getElementById(`product-type-${rowId}`).value = 'custom';
                toggleProductType(rowId);
                document.getElementById(`custom-name-${rowId}`).value = product.name;
            }
            
            document.getElementById(`price-${rowId}`).value = product.price;
            document.getElementById(`quantity-${rowId}`).value = product.quantity;
        });
        
        // Close modal and calculate totals
        document.querySelector('.history-modal').remove();
        calculateTotals();
        showNotification('Quotation loaded successfully', 'success');
    }
}

// PDF Generation Function (remaining parts)
// Function to generate quotation PDF
function generateQuotationPDF() {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    doc.setFont("helvetica");

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Enhanced colors with better contrast
    const primaryColor = [41, 128, 185];    // Bright blue
    const secondaryColor = [52, 73, 94];    // Dark blue
    const accentColor = [231, 76, 60];      // Red
    const textColor = [44, 62, 80];  

    // Header - Logo (with error handling)
    try {
        doc.addImage('assets/zocom no bg logo.png', 'PNG', margin, 15, 45, 45);
    } catch (error) {
        console.error('Error loading logo:', error);
        // Fallback text if logo fails to load
        doc.setFontSize(24);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("ZOCOM", margin, 40);
    }

    // Enhanced Contact Details with visual hierarchy
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('OpenSans', 'bold');
    
    const contactDetails = [
        { text: "CONTACT US", style: 'heading' },
        { text: "P.O. Box 102576-00101", style: 'normal' },
        { text: "Nairobi, Kenya", style: 'normal' },
        { text: "Tel: +254 722 123456", style: 'normal' },
        { text: "     +254 733 123456", style: 'normal' },
        { text: "Email: info@zocomlimited.co.ke", style: 'highlight' },
        { text: "www.zocomlimited.co.ke", style: 'highlight' }
    ];

    let rightColumnY = 20;
    contactDetails.forEach(detail => {
        switch (detail.style) {
            case 'heading':
                doc.setFont('OpenSans', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                break;
            case 'highlight':
                doc.setFont('OpenSans', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                break;
            default:
                doc.setFont('OpenSans', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        }
        doc.text(detail.text, pageWidth - margin, rightColumnY, { align: 'right' });
        rightColumnY += 6;
    });

    // Enhanced separator line with gradient effect
    const gradient = doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.75);
    doc.line(margin, 70, pageWidth - margin, 70);

    // Quotation title with enhanced styling
    doc.setFontSize(28);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('OpenSans', 'bold');
    doc.text("QUOTATION", pageWidth / 2, 85, { align: "center" });

    // Enhanced quotation details section
    const quotationNumber = `QT${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
    
    // Left side details with better spacing
    let leftDetailY = 100;
    doc.setFontSize(11);
    doc.setFont('OpenSans', 'bold');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Quotation Details:", margin, leftDetailY);
    
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const quotationDetails = [
        `Quotation No: ${quotationNumber}`,
        `Date: ${new Date().toLocaleDateString()}`,
        `Valid Until: ${document.getElementById('quotation-validity').value || 'N/A'}`
    ];
    
    quotationDetails.forEach((detail, index) => {
        doc.text(detail, margin + 5, leftDetailY + ((index + 1) * 7));
    });

    // Right side customer details with enhanced styling
    doc.setFont('OpenSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Bill To:", pageWidth - margin - 60, leftDetailY);
    
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    const customerName = document.getElementById('customer-name').value || 'N/A';
    const customerEmail = document.getElementById('customer-email').value || 'N/A';
    const customerPhone = document.getElementById('customer-phone').value || 'N/A';

    const customerDetails = [
        customerName,
        `Email: ${customerEmail}`,
        `Phone: ${customerPhone}`
    ];
    
    customerDetails.forEach((detail, index) => {
        doc.text(detail, pageWidth - margin - 60, leftDetailY + ((index + 1) * 7));
    });

    // Enhanced table styling
    const tableStartY = 140;
    const tableData = [];
    let totalDiscount = 0;

    // Prepare table data with proper formatting
    document.querySelectorAll('.product-row').forEach((row, index) => {
        const productType = document.getElementById(`product-type-${index}`)?.value;
        const priceInput = document.getElementById(`price-${index}`);
        const quantityInput = document.getElementById(`quantity-${index}`);
        const discountType = document.getElementById(`discount-type-${index}`)?.value;
        const discountValue = document.getElementById(`discount-value-${index}`)?.value;

        if (!priceInput?.value || !quantityInput?.value) return;

        const basePrice = parseFloat(priceInput.value);
        const quantity = parseInt(quantityInput.value);
        
        // Calculate discount with enhanced precision
        let discountAmount = 0;
        if (discountType && discountValue) {
            if (discountType === 'percentage') {
                discountAmount = (basePrice * parseFloat(discountValue) / 100) * quantity;
            } else if (discountType === 'fixed') {
                discountAmount = parseFloat(discountValue) * quantity;
            }
        }
        totalDiscount += discountAmount;

        const subtotal = (basePrice * quantity) - discountAmount;
        const vat = subtotal * 0.16;
        
        let productName = '';
        if (productType === 'custom') {
            productName = document.getElementById(`custom-name-${index}`).value || 'Custom Product';
        } else {
            const equipmentSelect = document.getElementById(`equipment-${index}`);
            productName = equipmentSelect.value ? equipmentSelect.value.split('|')[0] : '';
        }

        tableData.push([
            index + 1,
            {
                content: productName,
                styles: { 
                    cellWidth: 'auto',
                    cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
                    overflow: 'linebreak',
                    minCellWidth: 60
                }
            },
            quantity,
            formatCurrency(basePrice).replace('KES ', ''),
            discountAmount > 0 ? formatCurrency(discountAmount).replace('KES ', '') : '-',
            formatCurrency(subtotal).replace('KES ', ''),
            formatCurrency(vat).replace('KES ', ''),
            formatCurrency(subtotal + vat).replace('KES ', '')
        ]);
    });

    // Enhanced table configuration with better spacing
   // Enhanced table configuration with better spacing and smaller fonts
   doc.autoTable({
    startY: tableStartY,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Discount', 'Subtotal', 'VAT', 'Total']],
    body: tableData,
    theme: 'striped',
    styles: {
        fontSize: 8, // Reduced from 9
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }, // Reduced padding
        lineColor: [189, 195, 199],
        lineWidth: 0.1,
        font: "helvetica", // Changed from OpenSans
        textColor: textColor,
        minCellHeight: 8, // Reduced from 10
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'wrap'
    },
    headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 8, // Reduced from 10
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } // Reduced padding
    },
    columnStyles: {
        0: { 
            cellWidth: 8, // Reduced from 12
            halign: 'center',
            fontSize: 7
        },
        1: { 
            cellWidth: 'auto',
            minCellWidth: 50, // Reduced from 60
            maxCellWidth: 80, // Added maximum width
            cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
            overflow: 'linebreak',
            fontSize: 7 // Smaller font for description
        },
        2: { 
            cellWidth: 15, // Reduced from 20
            halign: 'center',
            fontSize: 7
        },
        3: { 
            cellWidth: 20, // Reduced from 25
            halign: 'right',
            fontSize: 7
        },
        4: { 
            cellWidth: 20, // Reduced from 25
            halign: 'right',
            fontSize: 7
        },
        5: { 
            cellWidth: 20, // Reduced from 25
            halign: 'right',
            fontSize: 7
        },
        6: { 
            cellWidth: 20, // Reduced from 25
            halign: 'right',
            fontSize: 7
        },
        7: { 
            cellWidth: 25, // Reduced from 30
            halign: 'right',
            fontSize: 7
        }
    },
    alternateRowStyles: {
        fillColor: [249, 249, 249]
    },
    margin: { left: 10, right: 10 }, // Added margins
    didParseCell: function(data) {
        // Special formatting for description column
        if (data.column.index === 1) {
            data.cell.styles.fontSize = 7;
            data.cell.styles.fontStyle = 'normal';
            if (data.cell.text && data.cell.text.length > 50) {
                data.cell.styles.fontSize = 6; // Even smaller font for long descriptions
            }
        }
    },
    willDrawCell: function(data) {
        // Ensure text fits in cells
        if (data.cell.text && data.cell.text.length > 0) {
            if (data.column.index === 1) {
                // Handle description column
                const textWidth = doc.getStringUnitWidth(data.cell.text[0]) * data.cell.styles.fontSize;
                if (textWidth > data.cell.width) {
                    data.cell.styles.fontSize = Math.min(
                        data.cell.styles.fontSize,
                        (data.cell.width / textWidth) * data.cell.styles.fontSize
                    );
                }
            }
        }
    }
});

    // Enhanced summary section
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Check if summary will fit on current page
    if (finalY + 90 > pageHeight - margin) {
        doc.addPage();
    }

    // Enhanced totals section with gradient background
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(pageWidth - 95, doc.lastAutoTable.finalY + 10, 80, 70, 3, 3, 'F');

    let summaryY = doc.lastAutoTable.finalY + 20;
    
    // Enhanced summary details with better typography
    doc.setFontSize(10);
    const summaryLabelsX = pageWidth - 90;
    const summaryValuesX = pageWidth - 20;

    // Subtotal with enhanced styling
    doc.setFont("OpenSans", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Subtotal:", summaryLabelsX, summaryY);
    doc.setFont("OpenSans", "normal");
    doc.text(document.getElementById('grand-subtotal').textContent, summaryValuesX, summaryY, { align: 'right' });

    // Enhanced discount display
    if (totalDiscount > 0) {
        summaryY += 12;
        doc.setFont("OpenSans", "bold");
        doc.text("Discount:", summaryLabelsX, summaryY);
        doc.setFont("OpenSans", "normal");
        doc.text(`-${formatCurrency(totalDiscount)}`, summaryValuesX, summaryY, { align: 'right' });
    }

    // VAT with enhanced styling
    summaryY += 12;
    doc.setFont("OpenSans", "bold");
    doc.text("VAT (16%):", summaryLabelsX, summaryY);
    doc.setFont("OpenSans", "normal");
    doc.text(document.getElementById('grand-vat').textContent, summaryValuesX, summaryY, { align: 'right' });

    // Enhanced grand total with prominent styling
    summaryY += 18;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(pageWidth - 95, summaryY - 8, 80, 12, 2, 2, 'F');
    doc.setFont("OpenSans", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("GRAND TOTAL", summaryLabelsX, summaryY);
    doc.text(document.getElementById('grand-total').textContent, summaryValuesX, summaryY, { align: 'right' });

    // Enhanced terms and conditions section
    let termsY = summaryY + 35;
    if (termsY + 90 > pageHeight - margin) {
        doc.addPage();
        termsY = margin + 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Terms and Conditions", margin, termsY);

    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("OpenSans", "normal");
    
 
    const terms = [
        "All prices are inclusive of 16% VAT",
      
    ];

    terms.forEach((term, index) => {
        termsY += 7;
        doc.text(term, margin, termsY);
    });

    // Add bank details section
    termsY += 15;
    doc.setFont("OpenSans", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Bank Details", margin, termsY);

    doc.setFont("OpenSans", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    const bankDetails = [
        "Bank: co-operative bank",
        "Account Name: Zocom Limited",
        "Account Number: 01120039960800",
        "Branch: Lavington",
        "Till number: 526928 - Zocom limited"
    ];

    bankDetails.forEach((detail, index) => {
        termsY += 7;
        doc.text(detail, margin, termsY);
    });

    // Add signature section if it fits on the page
    if (termsY + 40 <= pageHeight - margin) {
        termsY += 25;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, termsY, margin + 60, termsY);
        
        doc.setFont("OpenSans", "normal");
        doc.setFontSize(8);
        doc.text("Authorized Signature", margin, termsY + 5);
    }

    // Add metadata to the PDF
    doc.setProperties({
        title: `Quotation ${quotationNumber} for ${customerName}`,
        subject: 'Business Quotation',
        author: 'Zocom Solutions',
        keywords: 'quotation, business, zocom',
        creator: 'Zocom Solutions PDF Generator'
    });

    // Add final page number and total pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
    }

    // Generate filename with proper formatting
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const customerNameForFile = customerName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const fileName = `Quotation_${quotationNumber}_${customerNameForFile}_${timestamp}.pdf`;

    // Save the PDF with error handling
    try {
        doc.save(fileName);
        console.log('PDF generated successfully:', fileName);
        return {
            success: true,
            fileName: fileName,
            quotationNumber: quotationNumber,
            timestamp: timestamp
        };
    } catch (error) {
        console.error('Error generating PDF:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Helper function for currency formatting
function formatCurrency(amount) {
    return `KES ${parseFloat(amount).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}
// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function calculateTotalQuantity() {
    let totalQuantity = 0;
    document.querySelectorAll('[id^="quantity-"]').forEach(input => {
        totalQuantity += parseInt(input.value) || 0;
    });
    return totalQuantity;
}

function getSelectedProducts() {
    const products = [];
    document.querySelectorAll('.product-row').forEach((row, index) => {
        const productType = document.getElementById(`product-type-${index}`)?.value;
        const priceInput = document.getElementById(`price-${index}`);
        const quantityInput = document.getElementById(`quantity-${index}`);
        
        if (priceInput?.value && quantityInput?.value) {
            const product = {
                type: productType,
                price: parseFloat(priceInput.value),
                quantity: parseInt(quantityInput.value)
            };
            
            if (productType === 'custom') {
                product.name = document.getElementById(`custom-name-${index}`).value || 'Custom Product';
            } else {
                const categorySelect = document.getElementById(`category-${index}`);
                const equipmentSelect = document.getElementById(`equipment-${index}`);
                product.category = categorySelect.value;
                product.name = equipmentSelect.value ? equipmentSelect.value.split('|')[0] : '';
            }
            
            products.push(product);
        }
    });
    return products;
}

function generateQuotationId() {
    return 'QT' + Date.now().toString().slice(-6);
}

function generateProfileId() {
    return 'CP' + Date.now().toString().slice(-6);
}






// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeButtons();
    addProductRow(); // Add initial product row
    initializeDiscountSystem();
    initializeHistoryViewer();
    initializeCustomerProfiles();
});