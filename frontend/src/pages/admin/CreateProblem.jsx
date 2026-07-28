import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProblemForm from "../../components/problems/ProblemForm";
import problemService from "../../services/problemService";

const CreateProblem = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const problem = await problemService.createProblem(payload);
      toast.success("Problem created");
      navigate(`/problems/${problem.slug}`);
    } catch (err) {
      toast.error(err.message || "Couldn't create problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Create a new problem</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        Fill in the details below. You can leave it unpublished as a draft.
      </p>

      <div className="mt-8">
        <ProblemForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create problem" />
      </div>
    </div>
  );
};

export default CreateProblem;
