import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
// import { Modal, Button } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useSnackbar } from "notistack";

import { LoadingButton } from "@mui/lab";

import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

import CompanyList from "./CompanyList";
import { FormControl, Grid, Rating, TextField } from "@mui/material";
import { send } from "process";
import companyService from "@services/company";
import { Company } from "@global/company";

interface AddOrUpdateCompanyModalProps {
  onClose: () => void;
  reload: () => void;
  companyData?: Company;
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

const addCompanyModalSchema = Joi.object().keys({
  companyName: Joi.string().max(100).required().messages({
    "string.empty": "Company name is required",
    "string.max": "Please input characters less than 100",
  }),
  companyURL: Joi.string()
    .max(150)
    .uri({ scheme: ["https", "http"] })
    .required()
    .messages({
      "string.empty": "Company URL is required",
      "string.max": "Please input characters less than 150",
      "string.uri": "Please input valid(full url with https:// or http://) URL",
    }),
  companyAddress: Joi.string().optional().min(0).max(255).messages({
    "string.max": "Please input characters less than 255",
  }),
  recruiterName: Joi.string()
    .optional()
    .min(0)
    .max(100)
    .messages({ "string.max": "Please input characters less than 100" }),
  recruiterEmail: Joi.string()
    .optional()
    .allow("")
    .email({ tlds: { allow: false }, ignoreLength: true })
    .min(0)
    .max(150)
    .messages({
      "string.max": "Please input characters less than 150",
      "string.email": "Please input valid email",
    }),
  recruiterNumber: Joi.string().optional().min(0).max(50).messages({
    "string.max": "Please input characters less than 50",
  }),
});

export default function CompanyAddModal({
  onClose,
  reload,
  companyData,
}: AddOrUpdateCompanyModalProps) {
  const {
    getValues,
    control,
    register,
    formState: { errors },
    reset,
    trigger,
  } = useForm({
    resolver: joiResolver(addCompanyModalSchema),
    defaultValues: companyData
      ? {
          companyName: companyData.companyName,
          companyURL: companyData.companyURL,
          companyAddress: companyData.companyAddress,
          recruiterName: companyData.recruiterName,
          recruiterEmail: companyData.recruiterEmail,
          recruiterNumber: companyData.recruiterNumber,
        }
      : {
          companyName: undefined,
          companyURL: undefined,
          companyAddress: undefined,
          recruiterName: undefined,
          recruiterEmail: undefined,
          recruiterNumber: undefined,
        },
    mode: "all",
  });

  const { enqueueSnackbar } = useSnackbar();

  const [rate, setRate] = useState<number>(companyData?.rate || 0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreate = async () => {
    // first validate all the fields
    const validationResult = await trigger();

    if (!validationResult) return;

    setIsLoading(true);

    try {
      const response = await companyService.addCompany({
        ...getValues(),
        rate,
      });

      onClose();
      reset();
      enqueueSnackbar("Company added successfully", { variant: "success" });
      reload();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    // first validate all the fields
    const validationResult = await trigger();

    if (!validationResult) return;

    setIsLoading(true);

    try {
      const response = await companyService.updateCompany({
        id: companyData?.id,
        ...getValues(),
        rate,
      });

      onClose();
      reset();
      enqueueSnackbar("Company updated successfully", { variant: "success" });
      reload();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Company
        </Typography>

        <hr />

        <Typography
          component="form"
          id="modal-modal-description"
          sx={{ mt: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("companyName")}
                    required
                    label="Company Name"
                    variant="standard"
                    fullWidth
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={7}>
              <Controller
                name="companyURL"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("companyURL")}
                    required
                    label="Company URL"
                    variant="standard"
                    fullWidth
                    error={!!errors.companyURL}
                    helperText={errors.companyURL?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="companyAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("companyAddress")}
                    label="Company Address"
                    variant="standard"
                    fullWidth
                    error={!!errors.companyAddress}
                    helperText={errors.companyAddress?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="recruiterName"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={() => {
                      field.onBlur();
                    }}
                    {...register("recruiterName")}
                    label="Recruiter Name"
                    variant="standard"
                    fullWidth
                    error={!!errors.recruiterName}
                    helperText={errors.recruiterName?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="recruiterEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={() => {
                      field.onBlur();
                    }}
                    {...register("recruiterEmail")}
                    label="Recruiter Email"
                    variant="standard"
                    fullWidth
                    error={!!errors.recruiterEmail}
                    helperText={errors.recruiterEmail?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="recruiterNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    onBlur={field.onBlur}
                    {...register("recruiterNumber")}
                    label="Recruiter Number"
                    variant="standard"
                    fullWidth
                    error={!!errors.recruiterNumber}
                    helperText={errors.recruiterNumber?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item>
              <h4>Rate: </h4>
              <Rating
                name="simple-controlled"
                value={rate}
                onChange={(event, newValue) => {
                  setRate(newValue);
                }}
              />
            </Grid>
          </Grid>
        </Typography>
        <hr />

        <Typography id="modal-modal-action" sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          {companyData ? (
            <LoadingButton
              onClick={handleUpdate}
              loading={isLoading}
              variant="contained"
              color="success"
              // onClick={handleAddNewCompany}
              autoFocus
              style={{ marginLeft: "15px" }}
              disabled={isLoading}
            >
              Update
            </LoadingButton>
          ) : (
            <LoadingButton
              onClick={handleCreate}
              loading={isLoading}
              variant="contained"
              color="success"
              // onClick={handleAddNewCompany}
              autoFocus
              style={{ marginLeft: "15px" }}
              disabled={isLoading}
	      data-cy='button-add'
            >
              Add
            </LoadingButton>
          )}
        </Typography>

        {/* <CircularProgress /> */}
      </Box>
    </Modal>
  );
}
