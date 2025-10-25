import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-textMain mb-2">404</h1>
      <p className="text-textDim mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-block bg-primary text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-primary-hover"
      >
        Go back to dashboard
      </Link>
    </div>
  );
}
