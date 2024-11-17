import React, { useEffect } from "react";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import { Outlet, useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const PrivateRoute: React.FC = () => {
  const { authState } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState === AuthStateEnum.NOT_AUTHENTICATED) {
      navigate("/login");
    }
  }, [navigate, authState]);

  if (authState === AuthStateEnum.AUTHENTICATED) {
    return <Outlet />;
  } else {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }
};

export default PrivateRoute;
