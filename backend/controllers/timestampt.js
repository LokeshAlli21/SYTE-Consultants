  export default function getCurrentISTTimestamp () {
    const date = new Date();
    return new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "+05:30");
  };