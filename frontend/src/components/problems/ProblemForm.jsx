import { useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Input from "../common/Input";
import Button from "../common/Button";

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "c", label: "C" },
];

const toCommaList = (arr) => (arr || []).join(", ");
const fromCommaList = (str) =>
  str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Shared create/edit form. `defaultValues` should already be shaped for the form
 * (arrays as comma strings are handled internally). `onSubmit(payload)` receives
 * the API-ready payload. `submitLabel` customizes the button text.
 */
const ProblemForm = ({ defaultValues, onSubmit, submitLabel = "Save problem", isSubmitting }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Easy",
      tagsInput: "",
      companiesInput: "",
      inputFormat: "",
      outputFormat: "",
      constraints: [{ value: "" }],
      examples: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      supportedLanguages: ["cpp", "java", "python", "javascript", "c"],
      starterCode: { cpp: "", java: "", python: "", javascript: "", c: "" },
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
      isPublished: false,
      ...defaultValues,
    },
  });

  const constraintsArray = useFieldArray({ control, name: "constraints" });
  const examplesArray = useFieldArray({ control, name: "examples" });
  const hiddenArray = useFieldArray({ control, name: "hiddenTestCases" });

  const submit = (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      tags: fromCommaList(data.tagsInput),
      companies: fromCommaList(data.companiesInput),
      inputFormat: data.inputFormat,
      outputFormat: data.outputFormat,
      constraints: data.constraints.map((c) => c.value).filter(Boolean),
      examples: data.examples.filter((e) => e.input && e.output),
      hiddenTestCases: data.hiddenTestCases.filter((h) => h.input && h.output),
      supportedLanguages: data.supportedLanguages,
      starterCode: data.starterCode,
      timeLimitMs: Number(data.timeLimitMs),
      memoryLimitKb: Number(data.memoryLimitKb),
      isPublished: data.isPublished,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8" noValidate>
      {/* --- Basics --- */}
      <section className="card p-6">
        <h2 className="font-display text-base font-semibold">Basics</h2>
        <div className="mt-4 space-y-5">
          <Input id="title" label="Title" error={errors.title} registration={register("title", { required: "Title is required" })} />

          <div>
            <label htmlFor="description" className="label-text">Description</label>
            <textarea
              id="description"
              rows={6}
              className="input-field font-mono text-xs"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="difficulty" className="label-text">Difficulty</label>
              <select id="difficulty" className="input-field" {...register("difficulty")}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex items-end gap-2 pb-2.5">
              <input id="isPublished" type="checkbox" className="h-4 w-4 rounded accent-duel-500" {...register("isPublished")} />
              <label htmlFor="isPublished" className="font-body text-sm">Published (visible to all users)</label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input id="tagsInput" label="Tags (comma-separated)" placeholder="array, hash-table" registration={register("tagsInput")} />
            <Input id="companiesInput" label="Companies (comma-separated)" placeholder="Google, Amazon" registration={register("companiesInput")} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="inputFormat" className="label-text">Input format</label>
              <textarea id="inputFormat" rows={2} className="input-field font-mono text-xs" {...register("inputFormat")} />
            </div>
            <div>
              <label htmlFor="outputFormat" className="label-text">Output format</label>
              <textarea id="outputFormat" rows={2} className="input-field font-mono text-xs" {...register("outputFormat")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input id="timeLimitMs" type="number" label="Time limit (ms)" registration={register("timeLimitMs")} />
            <Input id="memoryLimitKb" type="number" label="Memory limit (KB)" registration={register("memoryLimitKb")} />
          </div>
        </div>
      </section>

      {/* --- Constraints --- */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Constraints</h2>
          <Button type="button" variant="secondary" onClick={() => constraintsArray.append({ value: "" })}>
            <FiPlus size={14} /> Add
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {constraintsArray.fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <input className="input-field font-mono text-xs" placeholder="1 <= n <= 10^5" {...register(`constraints.${i}.value`)} />
              <button type="button" onClick={() => constraintsArray.remove(i)} className="shrink-0 text-fail/70 hover:text-fail" aria-label="Remove constraint">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Examples --- */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Examples</h2>
          <Button type="button" variant="secondary" onClick={() => examplesArray.append({ input: "", output: "", explanation: "" })}>
            <FiPlus size={14} /> Add example
          </Button>
        </div>
        <div className="mt-4 space-y-5">
          {examplesArray.fields.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-ink-600/10 p-4 dark:border-paper-200/10">
              <div className="flex items-center justify-between">
                <p className="font-body text-xs font-semibold text-ink-800/60 dark:text-paper-100/60">Example {i + 1}</p>
                {examplesArray.fields.length > 1 && (
                  <button type="button" onClick={() => examplesArray.remove(i)} className="text-fail/70 hover:text-fail" aria-label="Remove example">
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <textarea rows={2} className="input-field font-mono text-xs" placeholder="Input" {...register(`examples.${i}.input`)} />
                <textarea rows={2} className="input-field font-mono text-xs" placeholder="Output" {...register(`examples.${i}.output`)} />
              </div>
              <textarea rows={2} className="input-field mt-3 font-mono text-xs" placeholder="Explanation (optional)" {...register(`examples.${i}.explanation`)} />
            </div>
          ))}
        </div>
      </section>

      {/* --- Hidden test cases --- */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold">Hidden test cases</h2>
            <p className="mt-0.5 font-body text-xs text-ink-800/50 dark:text-paper-100/50">
              Used by Judge0 for grading (Phase 8) — never shown to users.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => hiddenArray.append({ input: "", output: "" })}>
            <FiPlus size={14} /> Add
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {hiddenArray.fields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-2">
              <textarea rows={1} className="input-field font-mono text-xs" placeholder="Input" {...register(`hiddenTestCases.${i}.input`)} />
              <textarea rows={1} className="input-field font-mono text-xs" placeholder="Expected output" {...register(`hiddenTestCases.${i}.output`)} />
              <button type="button" onClick={() => hiddenArray.remove(i)} className="mt-2 shrink-0 text-fail/70 hover:text-fail" aria-label="Remove hidden test case">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Languages & starter code --- */}
      <section className="card p-6">
        <h2 className="font-display text-base font-semibold">Languages & starter code</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {LANGUAGES.map((lang) => (
            <label key={lang.value} className="flex items-center gap-2 font-body text-sm">
              <input type="checkbox" value={lang.value} className="h-4 w-4 rounded accent-duel-500" {...register("supportedLanguages")} />
              {lang.label}
            </label>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4">
          {LANGUAGES.map((lang) => (
            <div key={lang.value}>
              <label className="label-text">{lang.label} starter code</label>
              <textarea rows={3} className="input-field font-mono text-xs" {...register(`starterCode.${lang.value}`)} />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export { toCommaList };
export default ProblemForm;
