class HealthMetrics {
  constructor() {
    this.metrics = [];
  }

  addMetric(type, value, date = new Date(), notes = '') {
    const metric = {
      id: Date.now(),
      type,
      value,
      date: date.toISOString(),
      notes,
      timestamp: Date.now()
    };
    this.metrics.push(metric);
    return metric;
  }

  removeMetric(id) {
    this.metrics = this.metrics.filter(m => m.id !== id);
  }

  getMetricsByType(type) {
    return this.metrics.filter(m => m.type === type);
  }

  getMetricsInRange(startDate, endDate) {
    return this.metrics.filter(m => {
      const metricDate = new Date(m.date);
      return metricDate >= startDate && metricDate <= endDate;
    });
  }

  getStatistics(type) {
    const typeMetrics = this.getMetricsByType(type);
    if (typeMetrics.length === 0) return null;

    const values = typeMetrics.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { avg, min, max, stdDev, count: values.length };
  }

  getAll() {
    return this.metrics;
  }

  setMetrics(metrics) {
    this.metrics = metrics;
  }

  clear() {
    this.metrics = [];
  }
}

export default HealthMetrics;
