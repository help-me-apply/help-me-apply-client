import { useRoutes } from "react-router-dom";
import { MainLayout } from "@layout";
import { CompanyContainer } from "@views/company";

const MainRoutes = {
  path: "/",
  element: <MainLayout />,

  children: [
    { path: "/", element: <div>Dashboard</div> },
    {
      path: "/company",
      element: (
        <div>
          <CompanyContainer />
        </div>
      ),
    },
    {
      path: "/job",
      element: <div>Job</div>,
    },
    {
      path: "/application",
      element: <div>Application</div>,
    },
  ],
};

export default function ThemeRoutes() {
  return useRoutes([MainRoutes]);
}