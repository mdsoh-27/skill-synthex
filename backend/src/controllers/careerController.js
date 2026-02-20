const fs = require('fs');
const path = require('path');

/**
 * Controller to fetch career ML model metrics
 */
const getCareerMetrics = (req, res) => {
    const metricsPath = path.join(__dirname, '../ml/data/career/model_metrics.json');

    try {
        if (!fs.existsSync(metricsPath)) {
            return res.status(404).json({
                success: false,
                message: "Metrics file not found. Please run ML training first."
            });
        }

        const metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));

        res.status(200).json({
            success: true,
            metrics: metricsData
        });
    } catch (error) {
        console.error("Error reading metrics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load metrics",
            error: error.message
        });
    }
};

module.exports = {
    getCareerMetrics
};
