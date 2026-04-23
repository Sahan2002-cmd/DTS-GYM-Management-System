// ============================================================
//  Workouts.jsx — Exercise Catalog & Live Library
//  Displays exercise library from GYM_EXERCISE_PROC
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExercises } from '../actions';
import Badge from '../components/Badge';

export default function Workouts() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.exercises);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchExercises());
  }, [dispatch]);

  const muscleGroups = ['All', ...new Set(data.map(ex => ex.muscleGroup).filter(Boolean))];

  const filtered = data.filter(ex => {
    const matchesSearch = (ex.exerciseName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (ex.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="page-title">Exercise Catalog</div>
          <div className="page-sub">Browse {data.length} expert-curated exercises</div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
            <input
              className="gym-input pl-8 w-60"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="gym-input"
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
          >
            {muscleGroups.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" style={{ color: 'var(--gym-accent)' }}></div>
          <div className="mt-4 text-sm" style={{ color: 'var(--gym-muted)' }}>Loading catalog...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center gym-card">
          <div className="text-4xl mb-4">🏋️</div>
          <div className="text-sm" style={{ color: 'var(--gym-muted)' }}>No exercises found matching your search.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ex) => (
            <div key={ex.exerciseId} className="gym-card group hover:scale-[1.02] transition-all duration-200" style={{ border: '1px solid var(--gym-border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(180,127,255,0.15)', color: 'var(--gym-accent)' }}>
                  {ex.muscleGroup === 'Chest' ? '👕' : ex.muscleGroup === 'Legs' ? '🦵' : ex.muscleGroup === 'Back' ? '🎒' : '💪'}
                </div>
                <Badge variant="active">{ex.muscleGroup || 'Full Body'}</Badge>
              </div>
              <div className="text-lg font-bold mb-2" style={{ color: 'var(--gym-text)', fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em' }}>
                {ex.exerciseName}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--gym-muted)', height: 48, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {ex.description || 'Focus on proper form and controlled movements for maximum effectiveness.'}
              </div>
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--gym-border)' }}>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--gym-accent)' }}>Difficulty: Intermediate</span>
                <button className="text-xs font-bold" style={{ color: 'var(--gym-accent3)' }}>Details →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
