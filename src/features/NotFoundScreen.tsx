import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-lg font-medium">Page not found</p>
      <Link to="/">
        <Button>Back to Today</Button>
      </Link>
    </div>
  )
}
