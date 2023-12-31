import { useContext, useMemo } from 'react'
import Context from './Context'

const useAction = () => {
  const actionContext = useContext(Context)
  const action = useMemo(() => {
    return actionContext.current
  }, [actionContext.current])
  return action
}

export default useAction
