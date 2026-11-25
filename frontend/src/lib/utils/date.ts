export function formatMessageDate(dateString: string) {
    const date = new Date(dateString);

    const today = new Date();

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();

    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return "Today";
    }

    if (isYesterday) {
        return "Yesterday";
    }

    return date.toLocaleDateString(
        [],

        {
            day: "numeric",

            month: "long",

            year: "numeric",
        },
    );
}

export function formatLastSeen(dateString?: string | null) {
    if (!dateString) {
        return "Offline";
    }

    const date = new Date(dateString);
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

    if (diffMinutes < 1) {
        return "Last seen just now";
    }

    if (diffMinutes < 60) {
        return `Last seen ${diffMinutes} min ago`;
    }

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    const day = formatMessageDate(dateString);

    return day === "Today"
        ? `Last seen today at ${time}`
        : `Last seen ${day.toLowerCase() === "yesterday" ? "yesterday" : day} at ${time}`;
}
