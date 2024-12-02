function calculateLoss() {
  const splitter = document.getElementById('splitter').value;
  const fiberDistance = parseFloat(document.getElementById('fiber-distance').value);
  const lossPerKm = parseFloat(document.getElementById('loss-per-km').value);
  const spliceLoss = parseFloat(document.getElementById('splice-loss').value);

  if (fiberDistance < 0) {
    alert("Fiber distance cannot be negative.");
    return;
  }

  let splitterLoss = 0;
  if (splitter === '1:2') {
    splitterLoss = -3;
  } else if (splitter === '1:4') {
    splitterLoss = -7;
  } else if (splitter === '1:8') {
    splitterLoss = -10;
  } else if (splitter === '1:16') {
    splitterLoss = -13;
  } else if (splitter === '1:32') {
    splitterLoss = -15;
  }

  const totalLoss = (fiberDistance * lossPerKm) + spliceLoss + splitterLoss;
  document.getElementById('loss-result').innerText = `Total Loss: ${totalLoss.toFixed(2)} dB`;
  document.getElementById('result').style.display = 'block';
}
