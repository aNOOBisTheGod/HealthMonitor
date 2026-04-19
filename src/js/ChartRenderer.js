class ChartRenderer {
  constructor() {
    this.charts = {};
  }

  drawLineChart(canvasId, data, label, color = 'rgb(59, 130, 246)') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(padding, padding, width, height);

    if (!data || data.length === 0) {
      ctx.fillStyle = 'rgb(107, 114, 128)';
      ctx.font = '14px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
      return;
    }

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const normalizedValue = (value - minValue) / range;
      const y = padding + height - normalizedValue * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    ctx.fillStyle = color;
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const normalizedValue = (value - minValue) / range;
      const y = padding + height - normalizedValue * height;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgb(209, 213, 219)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgb(107, 114, 128)';
    ctx.font = '12px Roboto';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (i / 4) * range;
      const y = padding + (1 - i / 4) * height;
      ctx.fillText(Math.round(value), padding - 5, y + 4);
    }
  }

  drawBarChart(canvasId, labels, data, color = 'rgb(16, 185, 129)') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(padding, padding, width, height);

    if (!data || data.length === 0) {
      ctx.fillStyle = 'rgb(107, 114, 128)';
      ctx.font = '14px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
      return;
    }

    const maxValue = Math.max(...data);
    const barWidth = width / data.length;

    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * height;
      const x = padding + index * barWidth + 10;
      const y = padding + height - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 20, barHeight);

      ctx.fillStyle = 'rgb(107, 114, 128)';
      ctx.font = '12px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + barWidth / 2 - 10, padding + height + 20);

      if (labels && labels[index]) {
        ctx.save();
        ctx.translate(x + barWidth / 2 - 10, padding + height + 35);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(labels[index], 0, 0);
        ctx.restore();
      }
    });
  }
}

export default ChartRenderer;
