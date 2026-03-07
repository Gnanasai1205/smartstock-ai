const Product = require('../models/Product');
const { generateStructuredJSON, generateChatResponse } = require('../services/groqService');

// Get generic insights about inventory
exports.getInsights = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' });
    
    // Default metrics if there are no products
    if (products.length === 0) {
      return res.json({
        totalProducts: 0,
        lowStockCount: 0,
        mostExpensiveProduct: null,
        totalInventoryValue: 0,
        restockProducts: []
      });
    }

    const totalProducts = products.length;

    // Feature 4: AI Inventory Insights Dashboard
    // Feature 8: AI Product Value Analysis
    // We send a stripped down payload of the inventory state to Gemini
    const inventoryContext = products.map(p => ({
      name: p.name,
      price: p.price,
      quantity: p.quantity
    }));

    const schema = {
      type: "object",
      properties: {
        lowStockCount: {
          type: "integer",
          description: "Count of items with quantity less than 10."
        },
        mostExpensiveProduct: {
          type: "string",
          description: "The name of the product with the highest 'price'."
        },
        totalInventoryValue: {
          type: "number",
          description: "The total mathematical sum of (price * quantity) for all items."
        },
        restockProducts: {
          type: "array",
          items: { type: "string" },
          description: "List of product names that have less than 10 quantity."
        }
      },
      required: ["lowStockCount", "mostExpensiveProduct", "totalInventoryValue", "restockProducts"]
    };

    const aiResult = await generateStructuredJSON(
        "You are an expert warehouse analyst. Calculate precise totals from the provided JSON inventory array.",
        JSON.stringify(inventoryContext),
        schema
    );

    // AI Insight formatted response
    res.json({
      totalProducts,
      lowStockCount: aiResult.lowStockCount,
      mostExpensiveProduct: aiResult.mostExpensiveProduct,
      totalInventoryValue: aiResult.totalInventoryValue,
      restockProducts: aiResult.restockProducts
    });
    
  } catch (error) {
    console.error('Insights Error:', error);
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// Evaluate stock predictions
exports.getPredictions = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' });

    // Feature 1: AI Demand Prediction
    // Feature 2: AI Stock Health Classification
    const inventoryContext = products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      threshold: p.lowStockThreshold || 10
    }));

    const schema = {
      type: "object",
      properties: {
        predictions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: { type: "string" },
              quantity: { type: "integer" },
              prediction: { 
                type: "string",
                description: "Must be exactly 'Healthy', 'Low Stock', or 'Critical Stock'."
              }
            },
            required: ["product", "quantity", "prediction"]
          }
        }
      },
      required: ["predictions"]
    };

    const finalResult = await generateStructuredJSON(
      `Evaluate stock health.
       If quantity > threshold * 1.5, classify as 'Healthy'.
       If quantity <= threshold but > 0, classify as 'Low Stock'.
       If quantity is very low (e.g. <= 3), classify as 'Critical Stock'.`,
      JSON.stringify(inventoryContext),
      schema
    );

    res.json(finalResult.predictions || []);
  } catch (error) {
    console.error('Predictions Error:', error);
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// Get Restock Recommendations
exports.getRestockRecommendations = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' });

    // Feature 3: AI Restock Recommendation
    // Feature 10: AI Inventory Recommendations Panel (Dashboard)
    const inventoryContext = products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      threshold: p.lowStockThreshold || 10
    }));

    const schema = {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: { type: "string" },
              quantity: { type: "integer" },
              recommendation: { 
                type: "string",
                description: "Provide an actionable restock suggestion message (e.g. 'Restock 25 units'). If healthy, return 'Stock Healthy'."
              }
            },
            required: ["product", "quantity", "recommendation"]
          }
        }
      },
      required: ["recommendations"]
    };

    const finalResult = await generateStructuredJSON(
        "You are an AI inventory manager. Evaluate the array of items. Calculate an intelligent restock amount that brings the inventory comfortably past the listed threshold for elements that are low.",
        JSON.stringify(inventoryContext),
        schema
    );

    res.json(finalResult.recommendations || []);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// Feature 6: NLP AI Inventory Chat Assistant
exports.chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const products = await Product.find({ status: 'approved' });
    
    // Create a dense context payload for the LLM
    const systemContext = `
      CURRENT INVENTORY STATE DATABASE:
      ${products.map(p => `[${p.name} | Qty: ${p.quantity} | Price: ₹${p.price}]`).join('\n')}
      
      USER QUERY: "${message}"
      
      INSTRUCTIONS: Provide a short, direct answer in 1-3 sentences. Do not use formatting like markdown. Pull facts directly from the 'CURRENT INVENTORY STATE DATABASE' above. Be polite.
    `;

    const reply = await generateChatResponse(systemContext);

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat Assistant Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing AI chat' });
  }
};
