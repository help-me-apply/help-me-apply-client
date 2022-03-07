import { useState, useEffect, memo } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import JobList from "./JobList";
import AddJobModal from "./AddJobModal";
import JobService from "@services/job";

interface Job {
  id: string;
  jobLink: string;
  jobTitle?: string;
  jobLocation?: string;
  jobDescription?: string;
  jobRequirement?: string;
  jobExperienceLevel?: string;
  jobType?: number;
  jobSalaryRange?: string;
  jobStatus?: string;
  companyId: string;
}

const JobListMemo = memo(JobList);

export default function JobContainer() {
  const [isLoadingTableContent, setIsLoadingTableContent] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [reload, setReload] = useState({});
  const [isOpenAddJobModal, setIsOpenAddJobModal] = useState(false);

  const handleOpen = () => setIsOpenAddJobModal(true);
  const handleClose = () => setIsOpenAddJobModal(false);

  useEffect(() => {
    (async () => {
      setIsLoadingTableContent(true);

      const response = await JobService.getJobs(0);
      setJobs(response);

      setIsLoadingTableContent(false);
    })();
  }, [reload]);

  return (
    <div>
      <Box component="div" padding="30px">
        <Button
          variant="outlined"
          onClick={handleOpen}
          style={{ marginBottom: "10px" }}
        >
          Add Job
        </Button>
        <JobListMemo isLoading={isLoadingTableContent} jobs={jobs} />
        <AddJobModal
          open={isOpenAddJobModal}
          onClose={handleClose}
          reload={() => setReload({})}
        />
      </Box>
    </div>
  );
}
