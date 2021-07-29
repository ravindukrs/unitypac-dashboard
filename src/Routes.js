import React, { useState, useEffect, useContext } from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Main as MainLayout, Minimal as MinimalLayout } from './layouts';

import {
  Dashboard as DashboardView,
  ProductList as ProductListView,
  UserList as UserListView,
  Typography as TypographyView,
  Icons as IconsView,
  Account as AccountView,
  Settings as SettingsView,
  SignUp as SignUpView,
  SignIn as SignInView,
  NotFound as NotFoundView,
  Reports as ReportView,
  Envelope as EnvelopeView
} from './views';
import { FirebaseContext } from '../src/config/Firebase';




const Routes = () => {
  const contextValue = useContext(FirebaseContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchAuth = async () => {
      try {

        //Firebase Authentication to check if the user is logged in.
        await contextValue.auth.onAuthStateChanged(user => {
          if (user) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        })
      } catch (error) {
        console.log(error);
      }

    }
    console.log(isAuthenticated);
    fetchAuth();
  });

  return (
    isAuthenticated ? (
      <Switch>
        <Redirect
          exact
          from="/"
          to="/dashboard"
        />
        <RouteWithLayout
          component={DashboardView}
          exact
          layout={MainLayout}
          path="/dashboard"
        />
        <RouteWithLayout
          component={UserListView}
          exact
          layout={MainLayout}
          path="/users"
        />
        <RouteWithLayout
          component={ProductListView}
          exact
          layout={MainLayout}
          path="/products"
        />
        <RouteWithLayout
          component={TypographyView}
          exact
          layout={MainLayout}
          path="/typography"
        />
        <RouteWithLayout
          component={IconsView}
          exact
          layout={MainLayout}
          path="/icons"
        />
        <RouteWithLayout
          component={AccountView}
          exact
          layout={MainLayout}
          path="/account"
        />
        <RouteWithLayout
          component={EnvelopeView}
          exact
          layout={MainLayout}
          path="/envelope"
        />
        <RouteWithLayout
          component={SettingsView}
          exact
          layout={MainLayout}
          path="/settings"
        />
        <RouteWithLayout
          component={ReportView}
          exact
          layout={MainLayout}
          path="/reports"
        />
        <RouteWithLayout
          component={NotFoundView}
          exact
          layout={MinimalLayout}
          path="/not-found"
        />
        <Redirect to="/" />
      </Switch>
    ) : (
        <Switch>
          <RouteWithLayout
            component={SignUpView}
            exact
            layout={MinimalLayout}
            path="/sign-up"
          />
          <RouteWithLayout
            component={SignInView}
            exact
            layout={MinimalLayout}
            path="/sign-in"
          />
           <Redirect to="/sign-in" />
        </Switch>

      )

  );
};

export default Routes;
