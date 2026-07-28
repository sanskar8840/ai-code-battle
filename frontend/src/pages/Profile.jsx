import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiGithub, FiLinkedin, FiEdit2, FiMapPin } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import AvatarUpload from "../components/profile/AvatarUpload";
import BadgeList from "../components/dashboard/BadgeList";
import { getAchievements } from "../services/achievementService";
import { updateAvatar } from "../features/auth/authSlice";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const isOwnProfile = currentUser?.username === username;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

useEffect(() => {
  let cancelled = false;
  setLoading(true);

  const loadData = async () => {
    try {
      // Load achievements
      const achievementData = await getAchievements();
      if (!cancelled) {
        setAchievements(achievementData);
      }

      // Load profile
      const { data } = await api.get(`/users/${username}`);

      if (!cancelled) {
        setProfile(data.data.user);

        reset({
          name: data.data.user.name,
          bio: data.data.user.bio,
          country: data.data.user.country,
          college: data.data.user.college,
          github: data.data.user.github,
          linkedin: data.data.user.linkedin,
        });
      }
    } catch (err) {
      if (!cancelled) {
        toast.error(err.message || "Couldn't load profile");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadData();

  return () => {
    cancelled = true;
  };
}, [username, reset]);

  const onSubmit = async (formData) => {
    try {
      const { data } = await api.put("/users/me", formData);
      setProfile(data.data.user);
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            {isOwnProfile ? (
              <AvatarUpload
                name={profile.name}
                currentUrl={profile.avatar?.url}
                onUploaded={(avatar) => {
                  setProfile((p) => ({ ...p, avatar }));
                  dispatch(updateAvatar(avatar));
                }}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-duel-500/10 font-display text-2xl font-bold text-duel-500">
                {profile.avatar?.url ? (
                  <img src={profile.avatar.url} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile.name?.charAt(0).toUpperCase()
                )}
              </div>
            )}
            <div>
              <h1 className="font-display text-xl font-bold">{profile.name}</h1>
              <p className="font-mono text-sm text-ink-800/50 dark:text-paper-100/50">@{profile.username}</p>
            </div>
          </div>

          {isOwnProfile && !editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <FiEdit2 size={14} /> Edit profile
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <Input id="name" label="Name" error={errors.name} registration={register("name", { required: "Name is required" })} />
            <div>
              <label htmlFor="bio" className="label-text">Bio</label>
              <textarea id="bio" rows={3} maxLength={300} className="input-field" {...register("bio")} />
            </div>
            <Input id="country" label="Country" registration={register("country")} />
            <Input id="college" label="College" registration={register("college")} />
            <Input id="github" label="GitHub URL" registration={register("github")} />
            <Input id="linkedin" label="LinkedIn URL" registration={register("linkedin")} />

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>Save changes</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            {profile.bio && (
              <p className="mt-6 font-body text-sm text-ink-800/70 dark:text-paper-100/70">{profile.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
              {profile.country && (
                <span className="flex items-center gap-1"><FiMapPin size={14} /> {profile.country}</span>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-duel-500">
                  <FiGithub size={14} /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-duel-500">
                  <FiLinkedin size={14} /> LinkedIn
                </a>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-6">

  <div>
    <p className="font-mono text-xl font-semibold text-amber-500">
      {profile.rating}
    </p>
    <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
      Rating
    </p>
  </div>

  {/* 👇 Global Rank yahin hona chahiye */}
  <div>
    <p className="font-mono text-xl font-semibold text-yellow-500">
      #{profile.rank ?? "-"}
    </p>
    <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
      Global Rank
    </p>
  </div>

  <div>
    <p className="font-mono text-xl font-semibold">
      {profile.problemsSolved?.length ?? 0}
    </p>
    <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
      Solved
    </p>
  </div>

  <div>
    <p className="font-mono text-xl font-semibold text-pass">
      {profile.battlesWon ?? 0}
    </p>
    <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
      Battles Won
    </p>
  </div>

  <div>
    <p className="font-mono text-xl font-semibold text-fail">
      {profile.battlesLost ?? 0}
    </p>
    <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
      Battles Lost
    </p>
  </div>

  <div>
    <p className="font-mono text-xl font-semibold text-duel-500">
      {profile.currentStreak ?? 0}d
    </p>
    <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
      Streak
    </p>
  </div>

</div>


            

            <div className="mt-6 border-t border-ink-600/10 dark:border-paper-200/10 pt-6">
              <h2 className="mb-3 font-body text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
                Badges
              </h2>
              <BadgeList badges={profile.badges ?? []} />
            </div>

<div className="mt-8 border-t border-ink-600/10 dark:border-paper-200/10 pt-6">
  <h2 className="mb-4 font-display text-lg font-bold">
    Achievements
  </h2>

  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
    {achievements.map((achievement) => (
      <div
        key={achievement._id}
        className={`rounded-xl border p-4 text-center transition ${
          achievement.unlocked
            ? "border-green-500 bg-green-500/10"
            : "border-gray-600 opacity-60"
        }`}
      >
        <div
          className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full text-3xl"
          style={{ backgroundColor: achievement.color + "30" }}
        >
          {achievement.icon}
        </div>

        <h3 className="font-semibold">
          {achievement.title}
        </h3>

        <p className="mt-1 text-xs text-gray-400">
          {achievement.description}
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded bg-gray-700">
          <div
            className="h-full bg-green-500"
            style={{
              width: `${Math.min(
                (achievement.progress / achievement.value) * 100,
                100
              )}%`,
            }}
          />
        </div>

       <p className="mt-2 text-xs">
  {Math.min(achievement.progress, achievement.value)}/{achievement.value}
</p>

        {achievement.unlocked && (
          <span className="mt-2 inline-block rounded bg-green-600 px-2 py-1 text-xs">
            Unlocked
          </span>
        )}
      </div>
    ))}
  </div>
</div>





          </>
        )}

        {isOwnProfile && !editing && (
          <button
            onClick={logout}
            className="mt-8 font-body text-xs text-fail/80 hover:text-fail hover:underline"
          >
            Log out of your account
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
