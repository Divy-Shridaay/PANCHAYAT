import GlobalSettings from "../models/GlobalSettings.js";

// Default pricing if not set
const DEFAULT_PRICING = {
    pedhinamu: 1,
    rojmel: 1,
    jaminMehsul: 1
};

export const getPricing = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne({ key: "module_pricing" });

        if (!settings) {
            // Return defaults if not found in DB
            return res.json({
                success: true,
                pricing: DEFAULT_PRICING
            });
        }

        return res.json({
            success: true,
            pricing: settings.value
        });
    } catch (err) {
        console.error("Error fetching pricing:", err);
        return res.status(500).json({
            success: false,
            message: "કિંમતો લોડ કરવામાં નિષ્ફળ",
            error: err.message
        });
    }
};

export const updatePricing = async (req, res) => {
    try {
        const { pricing } = req.body;

        if (!pricing || typeof pricing !== "object") {
            return res.status(400).json({
                success: false,
                message: "અમાન્ય ડેટા"
            });
        }

        // Validate values (must be numbers and > 0)
        const keys = ["pedhinamu", "rojmel", "jaminMehsul"];
        for (const key of keys) {
            const val = Number(pricing[key]);
            if (isNaN(val) || val <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `${key} માટેની કિંમત 0 થી વધુ હોવી જોઈએ`
                });
            }
            pricing[key] = val; // Ensure numbers
        }

        const settings = await GlobalSettings.findOneAndUpdate(
            { key: "module_pricing" },
            { value: pricing },
            { upsert: true, new: true }
        );

        return res.json({
            success: true,
            message: "કિંમતો સફળતાપૂર્વક અપડેટ કરવામાં આવી છે",
            pricing: settings.value
        });
    } catch (err) {
        console.error("Error updating pricing:", err);
        return res.status(500).json({
            success: false,
            message: "કિંમતો અપડેટ કરવામાં નિષ્ફળ: " + err.message,
            error: err.message
        });
    }
};
