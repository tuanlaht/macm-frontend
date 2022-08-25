import React, { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, MenuItem, Select, TextField } from '@mui/material';

function EditCompetitive({ dataEdit, onEdit, onCancel, weightRange }) {
    const [gender, setGender] = useState(dataEdit.gender ? 1 : 0);
    const [weightRangeEdit, setWeightRangeEdit] = useState([weightRange]);

    const handleChange = (event) => {
        setGender(event.target.value);
    };

    function checkContain(arr1, arr2) {
        return arr1.some((item) => arr2.includes(item));
    }

    const checkWeight = (gender, min, max) => {
        let i;
        let newWeightRange = [];
        for (i = min; i < max; i = i + 0.5) {
            newWeightRange.push(i);
        }

        if (!checkContain(weightRange, newWeightRange)) {
            const newWeight = weightRangeEdit.concat(newWeightRange);
            setWeightRangeEdit(newWeight);
            return true;
        } else {
            return false;
        }
    };

    const handleEditCompetition = (data) => {
        if (data.weightMax < data.weightMin) {
            setFocus('weightMax', { shouldSelect: true });
            setError('weightMax', { message: 'Hạng cân tối đa không được nhỏ hơn hạng cân tối thiểu' });
        } else if (data.weightMax == data.weightMin) {
            setFocus('weightMax', { shouldSelect: true });
            setError('weightMax', {
                message: 'Hạng cân tối thiểu và tối đa không được trùng nhau',
            });
        } else if (!data.weightMax.toString().match(/^(\d+(\.(0|5){0,1})?)$/)) {
            setFocus('weightMax', { shouldSelect: true });
            setError('weightMax', {
                message: 'Vui lòng nhập đúng định dạng hạng cân(chữ số sau dấu phẩy là 5), VD: 42 hoặc 42.5',
            });
        } else if (!data.weightMin.toString().match(/^(\d+(\.(0|5){0,1})?)$/)) {
            setFocus('weightMin', { shouldSelect: true });
            setError('weightMin', {
                message: 'Vui lòng nhập đúng định dạng hạng cân(chữ số sau dấu phẩy là 5), VD: 42 hoặc 42.5',
            });
        } else {
            if (checkWeight(gender, data.weightMin, data.weightMax)) {
                const newData = { ...data, gender: dataEdit.gender, id: dataEdit.id, selected: dataEdit.selected };
                console.log(newData);
                onEdit && onEdit(newData);
            } else {
                setFocus('weightMin', { shouldSelect: true });
                setError('weightMin', {
                    message: 'Khoảng cân bạn nhập đã tồn tại, vui lòng nhập khoảng cân khác',
                });
                setError('weightMax', {
                    message: 'Khoảng cân bạn nhập đã tồn tại, vui lòng nhập khoảng cân khác',
                });
            }
        }
    };

    const validationSchema = Yup.object().shape({
        weightMin: Yup.number()
            .required('Không được để trống trường này')
            .typeError('Vui lòng nhập số')
            .min(40, 'Vui lòng nhập giá trị lớn hơn 39 Kg')
            .max(85, 'Vui lòng nhập giá trị nhỏ hơn 85 Kg'),
        weightMax: Yup.number()
            .required('Không được để trống trường này')
            .typeError('Vui lòng nhập số')
            .min(40, 'Vui lòng nhập giá trị lớn hơn 39Kg')
            .max(85, 'Vui lòng nhập giá trị nhỏ hơn 85 Kg'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setFocus,
        setError,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    return (
        <Grid container spacing={2} sx={{ p: 1 }}>
            <Grid item xs={4}>
                {/* <InputLabel id="demo-simple-select-label">Giới tính</InputLabel> */}
                <Select
                    labelId="demo-simple-select-label"
                    id="gender"
                    value={gender}
                    onChange={handleChange}
                    readOnly={true}
                >
                    <MenuItem value={1}>Nam</MenuItem>
                    <MenuItem value={0}>Nữ</MenuItem>
                </Select>
            </Grid>
            <Grid item xs={4}>
                {/* <InputLabel>Hạng cân</InputLabel> */}
                <TextField
                    fullWidth
                    type="number"
                    id="outlined-basic"
                    label="Hạng cân tối thiểu"
                    variant="outlined"
                    defaultValue={dataEdit.weightMin}
                    {...register('weightMin')}
                    error={errors.weightMin ? true : false}
                    helperText={errors.weightMin?.message}
                />
            </Grid>
            <Grid item xs={4}>
                <TextField
                    type="number"
                    id="outlined-basic"
                    label="Hạng cân tối đa"
                    variant="outlined"
                    defaultValue={dataEdit.weightMax}
                    {...register('weightMax')}
                    error={errors.weightMax ? true : false}
                    helperText={errors.weightMax?.message}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" color="success" onClick={handleSubmit(handleEditCompetition)} sx={{ m: 1 }}>
                    Chỉnh sửa
                </Button>
                <Button variant="contained" color="warning" onClick={() => onCancel && onCancel()}>
                    Hủy
                </Button>
            </Grid>
        </Grid>
    );
}

export default EditCompetitive;
