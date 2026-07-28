/**
 * Controlled-by-react-hook-form input. Pass `register('field', {...rules})`
 * as `registration`, and the field's error object from formState.errors.
 */
const Input = ({ label, id, type = "text", registration, error, placeholder, ...rest }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input-field ${error ? "border-fail focus:border-fail" : ""}`}
        {...registration}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="error-text">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Input;
