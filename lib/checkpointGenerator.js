const paceMultipliers = {
  light: 1.25,
  medium: 1,
  intense: 0.8,
};

export function formatDateInput(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateInput(d);
}

function daysBetween(start, end) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function generateCheckpoints({ totalPages, startDate, meetupDate, pace = "medium" }) {
  const totalDays = daysBetween(startDate, meetupDate);
  const adjustedDays = Math.max(1, Math.floor(totalDays * (paceMultipliers[pace] || 1)));

  let checkpointCount = Math.ceil(adjustedDays / 7);
  checkpointCount = Math.max(2, Math.min(checkpointCount, 8));

  const pagesPerCheckpoint = Math.ceil(totalPages / checkpointCount);
  const gapDays = Math.max(1, Math.floor(totalDays / checkpointCount));

  const checkpoints = [];
  let currentStart = 1;

  for (let i = 0; i < checkpointCount; i++) {
    const currentEnd = Math.min(totalPages, currentStart + pagesPerCheckpoint - 1);
    const date = i === checkpointCount - 1 ? meetupDate : addDays(startDate, gapDays * (i + 1));

    checkpoints.push({
      index: i + 1,
      date,
      startPage: currentStart,
      endPage: currentEnd,
    });

    currentStart = currentEnd + 1;
  }

  return checkpoints;
}