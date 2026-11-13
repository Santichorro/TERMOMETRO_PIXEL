// Bloque de lectura: una frase principal y puntos cortos con título en negrita.
export default function Explicacion({ lead, puntos }) {
  return (
    <>
      <p className="lead">{lead}</p>
      <ul className="puntos">
        {puntos.map(p => (
          <li key={p.t}>
            <strong>{p.t}</strong>
            <span>{p.d}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
