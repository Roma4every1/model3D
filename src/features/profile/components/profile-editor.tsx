import './profile.scss'

interface ProfileEditorProps {
  /** ID формы профиля. */
  id: FormID;
}


/** Панель редактирования профиля. */
export const ProfileEditor = ({id}: ProfileEditorProps) => {
  return (
    <div className={'profile-editor'}>
      Profile Editor {id}
    </div>
  )
};
