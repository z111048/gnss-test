import { LESSONS } from './lessonContent';
import { useGPSStore } from '../../store/gpsStore';

export function LessonStepper() {
  const { currentLesson, setLesson } = useGPSStore();

  return (
    <nav className="lesson-stepper">
      <div className="lesson-stepper-title">章節</div>
      {LESSONS.map((lesson) => (
        <button
          key={lesson.id}
          className={`lesson-step ${currentLesson === lesson.id ? 'active' : ''}`}
          onClick={() => setLesson(lesson.id)}
        >
          <span className="lesson-icon">{lesson.icon}</span>
          <div className="lesson-step-text">
            <div className="lesson-step-num">{lesson.id}</div>
            <div className="lesson-step-title">{lesson.title}</div>
            <div className="lesson-step-sub">{lesson.subtitle}</div>
          </div>
        </button>
      ))}
    </nav>
  );
}
