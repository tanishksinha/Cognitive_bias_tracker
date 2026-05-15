export default function RatingGrid({ options, factors, ratings, setRatings }) {

  const updateRating = (o, f, value) => {
    const newRatings = { ...ratings };
    newRatings[`${o}-${f}`] = value;
    setRatings(newRatings);
  };

  return (
    <div>
      {options.map((opt, i) => (
        <div key={i}>
          <h4>{opt}</h4>

          {factors.map((f, j) => (
            <input
              key={j}
              type="number"
              min="1"
              max="10"
              onChange={(e) =>
                updateRating(i, j, e.target.value)
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}