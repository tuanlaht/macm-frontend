import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    MenuItem,
    Snackbar,
    TextField,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/material/styles';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import NumberFormat from 'react-number-format';
import facilityApi from 'src/api/facilityApi';
let snackBarStatus;

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState();

    const Input = styled('input')({
        display: 'none',
    });

    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const onSelectFile = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        // I've kept this example simple by using the first image instead of multiple
        setSelectedFile(e.target.files[0]);
    };

    return (
        <div>
            {/* <input type="file" onChange={onSelectFile} /> */}
            {selectedFile && <img src={preview} alt="facility" />}
            <label htmlFor="contained-button-file">
                <Input accept="image/*" id="contained-button-file" type="file" onChange={onSelectFile} />
                <Button sx={{ mt: 1 }} variant="outlined" component="span" startIcon={<PhotoCamera />}>
                    Tải ảnh lên
                </Button>
            </label>
        </div>
    );
};

const AddFacilityDialog = ({ title, children, isOpen, handleClose, onSucess }) => {
    const [categoryList, setCategoryList] = useState([]);
    const [facilityList, setFacilityList] = useState([]);
    const [categoryId, setCategoryId] = useState(1);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [submittedData, setSubmitedData] = useState([]);
    // const [closeDialog, setCloseDialog] = useState(handleClose);

    const handleChangeCategory = (event) => {
        setCategoryId(event.target.value);
        console.log(event.target.value);
    };
    // const handleCloseDialog = ()=>{
    //     setCloseDialog(false);
    // }
    const [customAlert, setCustomAlert] = useState({ severity: '', message: '' });
    const dynamicAlert = (status, message) => {
        console.log('status of dynamicAlert', status);
        if (status) {
            setCustomAlert({ severity: 'success', message: message });
        } else {
            setCustomAlert({ severity: 'error', message: message });
        }
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Không được để trống trường này'),
        // category: Yup.string().required('Không được để trống trường này'),
        quantityUsable: Yup.number()
            .required('Không được để trống trường này')
            .typeError('Vui lòng nhập số')
            .min(0, 'Vui lòng nhập giá trị lớn hơn 0'),
        // quantityUsable: Yup.string()
        //     // .min(0, 'Vui lòng nhập giá trị lớn hơn 0')
        //     .required('Vui lòng không để trống trường này'),
    });

    const fetchFacilityCategory = async () => {
        try {
            const response = await facilityApi.getAllFacilityCategory();
            console.log(response.data);
            setCategoryList(response.data);
        } catch (error) {
            console.log('failed when fetch facility category', error);
        }
    };
    const fetchFacility = async (id) => {
        try {
            const response = await facilityApi.getAllFacilityByCategoryId(id);
            console.log(response.data);
            setFacilityList(response.data);
        } catch (error) {
            console.log('fetch facility failed', error);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackBar(false);
    };

    useEffect(() => {
        fetchFacilityCategory(categoryId);
    }, []);
    useEffect(() => {
        fetchFacility(categoryId);
    }, [categoryId]);
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState,
        formState: { errors, isSubmitSuccessful },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onBlur',
    });

    const onSubmit = (data) => {
        console.log('data', data);
        setSubmitedData(data);
        const submitData = {
            facilityCategoryId: categoryId,
            facilityName: data.name,
            quantityUsable: data.quantityUsable,
        };
        console.log(submitData);
        facilityApi.createNewFacility(submitData).then((res) => {
            console.log(res);
            if (res.data.length !== 0) {
                setOpenSnackBar(true);
                // setSnackBarStatus(true);
                snackBarStatus = true;
                dynamicAlert(snackBarStatus, res.message);
                onSucess && onSucess(res.data[0]);
            } else {
                console.log('huhu');
                setOpenSnackBar(true);
                // setSnackBarStatus(false);
                snackBarStatus = false;
                dynamicAlert(snackBarStatus, res.message);
            }
        });
    };

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset({ name: '', quantityUsable: '' });
        }
    }, [formState, submittedData, reset]);
    return (
        <Fragment>
            <Snackbar
                open={openSnackBar}
                autoHideDuration={5000}
                onClose={handleCloseSnackBar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackBar}
                    variant="filled"
                    severity={customAlert.severity || 'success'}
                    sx={{ width: '100%' }}
                >
                    {customAlert.message}
                </Alert>
            </Snackbar>
            <Dialog
                fullWidth
                maxWidth="md"
                open={!!isOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description">{children}</DialogContentText> */}
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { mb: 2 },
                        }}
                    >
                        <Grid container columns={12} spacing={2}>
                            <Grid item xs={6}>
                                <ImageUpload />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    sx={{ mt: 1 }}
                                    id="outlined-select-currency"
                                    control={control}
                                    name="facilityCategory"
                                    select
                                    fullWidth
                                    label="Danh mục"
                                    value={categoryId}
                                    onChange={handleChangeCategory}
                                    // {...register('category')}
                                    // error={errors.category ? true : false}
                                    // helperText={errors.category?.message}
                                >
                                    {categoryList &&
                                        categoryList.map((item) => {
                                            return (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            );
                                        })}
                                </TextField>
                                <TextField
                                    sx={{ mt: 1 }}
                                    required
                                    fullWidth
                                    defaultValue=""
                                    label="Tên"
                                    {...register('name')}
                                    error={errors.name ? true : false}
                                    helperText={errors.name?.message}
                                />

                                <TextField
                                    sx={{ mt: 1 }}
                                    type="number"
                                    required
                                    id="outlined-disabled"
                                    label="Số lượng"
                                    fullWidth
                                    {...register('quantityUsable')}
                                    error={errors.quantityUsable ? true : false}
                                    helperText={errors.quantityUsable?.message}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button onClick={handleSubmit(onSubmit)} autoFocus>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
};

export default AddFacilityDialog;
