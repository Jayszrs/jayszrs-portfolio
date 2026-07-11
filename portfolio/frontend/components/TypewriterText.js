export default function TypewriterText({ words = [], fallback = "Web Developer" }) {
  const activeWord = words?.[0] || fallback;

  return (
    <span>{activeWord}</span>
  );
}
