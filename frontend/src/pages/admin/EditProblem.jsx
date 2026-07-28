import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProblemForm, { toCommaList } from "../../components/problems/ProblemForm";
import problemService from "../../services/problemService";
import Spinner from "../../components/common/Spinner";

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    problemService
      .getProblem(id)
      .then((data) => {
        if (!cancelled) setProblem(data);
      })
      .catch((err) => toast.error(err.message || "Couldn't load problem"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const updated = await problemService.updateProblem(id, payload);
      toast.success("Problem updated");
      navigate(`/problems/${updated.slug}`);
    } catch (err) {
      toast.error(err.message || "Couldn't update problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!problem) return null;

  const defaultValues = {
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    tagsInput: toCommaList(problem.tags),
    companiesInput: toCommaList(problem.companies),
    inputFormat: problem.inputFormat || "",
    outputFormat: problem.outputFormat || "",
    constraints: problem.constraints?.length ? problem.constraints.map((c) => ({ value: c })) : [{ value: "" }],
    examples: problem.examples?.length ? problem.examples : [{ input: "", output: "", explanation: "" }],
    hiddenTestCases: problem.hiddenTestCases?.length ? problem.hiddenTestCases : [{ input: "", output: "" }],
    supportedLanguages: problem.supportedLanguages,
    starterCode: problem.starterCode,
    timeLimitMs: problem.timeLimitMs,
    memoryLimitKb: problem.memoryLimitKb,
    isPublished: problem.isPublished,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Edit problem</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">{problem.title}</p>

      <div className="mt-8">
        <ProblemForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
};

export default EditProblem;
