import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
// import { Modal, Button } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Autocomplete from "@mui/material/Autocomplete";
import { useSnackbar } from "notistack";

import { LoadingButton } from "@mui/lab";

import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  TextField,
} from "@mui/material";
import { send } from "process";
import jobService from "@services/job";
import companyService from "@services/company";

interface JobAddModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
}

const style = {
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "1px solid gold",
  boxShadow: 24,
  p: 4,
};

const addJobModalSchema = Joi.object().keys({
  jobTitle: Joi.string().max(100).required().messages({
    "string.empty": "Job title is required",
    "string.max": "Please input characters less than 100",
  }),
  jobLink: Joi.string()
    .max(150)
    .uri({ scheme: ["https", "http"] })
    .required()
    .messages({
      "string.empty": "Job URL is required",
      "string.max": "Please input characters less than 150",
      "string.uri": "Please input valid(full url with https:// or http://) URL",
    }),
  jobLocation: Joi.string().optional().min(0).max(255).messages({
    "string.max": "Please input characters less than 255",
  }),
  jobDescription: Joi.string()
    .optional()
    .min(0)
    .max(100)
    .messages({ "string.max": "Please input characters less than 100" }),
  jobRequirement: Joi.string().optional().min(0).max(150).messages({
    "string.max": "Please input characters less than 150",
    "string.email": "Please input valid email",
  }),
  jobExperienceLevel: Joi.string().optional().min(0).max(255).messages({
    "string.max": "Please input characters less than 255",
  }),
  jobType: Joi.string()
    .allow("")
    .optional()
    // .min(0)
    // .max(255)
    .messages({
      //   "string.max": "Please input characters less than 255",
    }),
  jobSalaryRange: Joi.string().optional().min(0).max(50).messages({
    "string.max": "Please input characters less than 50",
  }),
  jobStatus: Joi.string().optional().min(0).max(255).messages({
    "string.max": "Please input characters less than 255",
  }),
  // FIXME: uuid repalce string
  companyId: Joi.string(),
});

export default function JobAddModal({ onClose, reload }: JobAddModalProps) {
  const [companyOptions, setCompanyOptions] = useState([]);
  const [searchCompanyByName, setSearchCompanyByName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState();

  const {
    getValues,
    control,
    register,
    formState: { errors },
    reset,
    trigger,
    setValue,
  } = useForm({
    resolver: joiResolver(addJobModalSchema),
    defaultValues: {
      companyId: undefined,
      jobLink: undefined,
      jobTitle: undefined,
      jobLocation: undefined,
      jobDescription: undefined,
      jobRequirement: undefined,
      jobExperienceLevel: undefined,
      jobType: "",
      jobSalaryRange: undefined,
      jobStatus: undefined,
    },
    mode: "all",
  });

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCompanyOptions = async () => {
      const companies = await companyService.searchCompanyByName(
        searchCompanyByName
      );

      console.log(companies);

      const _remapCompanyOptions = companies.length
        ? companies.map((company) => ({
            label: company.companyName,
          }))
        : [];

      console.log(_remapCompanyOptions);

      setCompanyOptions(_remapCompanyOptions);
    };

    fetchCompanyOptions();
  }, [searchCompanyByName]);

  const handleCreate = async () => {
    setIsLoading(true);

    const response = await jobService.addJob(getValues());

    setIsLoading(false);

    onClose();
    reset();
    enqueueSnackbar("Job added successfully", { variant: "success" });
    reload();
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Job
        </Typography>

        <hr />

        <Autocomplete
          disablePortal
          options={companyOptions}
          sx={{ width: 500 }}
          onChange={(event, newValue) => setValue("companyId", newValue.id)}
          onInputChange={(event, newInputValue) => {
            console.log(newInputValue);
            setSearchCompanyByName(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              required
              {...params}
              label="Related Company"
              variant="standard"
            />
          )}
        />

        <Typography
          component="form"
          id="modal-modal-description"
          sx={{ mt: 2, mb: 4 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Controller
                name="jobTitle"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("jobTitle")}
                    required
                    label="Job Title"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobTitle}
                    helperText={errors.jobTitle?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={7}>
              <Controller
                name="jobLink"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("jobLink")}
                    required
                    label="Job Link"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobLink}
                    helperText={errors.jobLink?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="jobRequirement"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={() => {
                      field.onBlur();
                    }}
                    {...register("jobRequirement")}
                    label="Job Requirement"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobRequirement}
                    helperText={errors.jobRequirement?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="jobLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={() => {
                      field.onBlur();
                    }}
                    {...register("jobLocation")}
                    label="Job Location"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobLocation}
                    helperText={errors.jobLocation?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="jobExperienceLevel"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("jobExperienceLevel")}
                    label="Job Experience Level"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobExperienceLevel}
                    helperText={errors.jobExperienceLevel?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="jobType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="jobType">Job Type</InputLabel>
                    <Select
                      onBlur={field.onBlur}
                      {...register("jobType")}
                      labelId="jobType"
                      //   label="Job Type"
                      variant="standard"
                      fullWidth
                      error={!!errors.jobType}
                      // helperText={errors.jobType?.message}
                      {...field}
                    >
                      <MenuItem value={""}>None</MenuItem>
                      <MenuItem value={"full-time"}>Full Time</MenuItem>
                      <MenuItem value={"part-time"}>Part Time</MenuItem>
                      <MenuItem value={"contract"}>Contract</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="jobSalaryRange"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("jobSalaryRange")}
                    label="Job Salary Range"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobSalaryRange}
                    helperText={errors.jobSalaryRange?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="jobStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("jobStatus")}
                    label="Job Status"
                    variant="standard"
                    fullWidth
                    error={!!errors.jobStatus}
                    helperText={errors.jobStatus?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="jobDescription"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("jobDescription")}
                    label="Job Description"
                    variant="outlined"
                    fullWidth
                    error={!!errors.jobDescription}
                    helperText={errors.jobDescription?.message}
                    {...field}
                    multiline
                    minRows={6}
                    maxRows={10}
                    sx={{ mt: 2 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Typography>
        <hr />

        <Typography id="modal-modal-action" sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton
            onClick={handleCreate}
            loading={isLoading}
            variant="contained"
            color="success"
            // onClick={handleAddNewJob}
            autoFocus
            style={{ marginLeft: "15px" }}
            disabled={isLoading}
          >
            Add
          </LoadingButton>
        </Typography>

        {/* <CircularProgress /> */}
      </Box>
    </Modal>
  );
}
