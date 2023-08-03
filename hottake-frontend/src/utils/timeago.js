export const timeAgo = (dateString) => {
  const date = Date.parse(dateString);

  const seconds = Math.floor((new Date() - date) / 1000);

  const years = Math.floor(seconds / 31516000);
  if (years > 1) return `${years} years ago`;
  else if (years === 1) return "1 year ago";

  const months = Math.floor(seconds / 2592000);
  if (months > 1) return `${months} months ago`;
  else if (months === 1) return "1 month ago";

  const days = Math.floor(seconds / 86400);
  if (days > 1) return `${days} days ago`;
  else if (days === 1) return "1 day ago";

  const hours = Math.floor(seconds / 3600);
  if (hours > 1) return `${hours} hours ago`;
  else if (hours === 1) return "1 hour ago";

  const minutes = Math.floor(seconds / 60);
  if (minutes > 1) return `${minutes} minutes ago`;
  else if (minutes === 1) return "1 minute ago";

  if (seconds < 10) return "just now";

  return `${Math.floor(seconds)} seconds ago`;
};
