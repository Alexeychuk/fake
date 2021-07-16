import React from "react"
import { Route, Switch } from "react-router-dom"
import Login from "./components/auth/Login"

const App = () => {

  return (
    <main>
      <Switch>
        <Route
          exact
          path="/"
          component={Login}
        />

      </Switch>
    </main>
  )
}

export default App;
