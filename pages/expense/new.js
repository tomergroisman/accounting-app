import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Hidden from '@material-ui/core/Hidden'
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import auth0 from '../../lib/auth0';
import { setExpenses } from '../../hooks/expensesHooks';
import { newExpenseFetcher } from '../../helpers/fetchers';
import { numberWithCommas, formaDateToSubmit, fixApostrophes } from '../../helpers/functions';
import useStyles from '../../styles/pages/newStyles';
import PageTitle from '../../components/PageTitle';

export default function Expense(props) {
    const { popup, fetched } = props;
    const [entry, setEntry] = popup;
    const classes = useStyles(props);
    const [
            apis, category, supplier, reference, date, price, vat, total, comments,
            handleChange, valid
        ] = setExpenses(popup, JSON.parse(fetched));
    const { categoryList, suppliersList } = apis;
    const router = useRouter();
    const firstUpdate = useRef(true);

    /**
     * Handle submit function
     */
    const handleSubmit = async () => {
        if (valid.validator.isValid) {
            const data = {
                category: category,
                supplier: supplier,
                reference: reference,
                date: formaDateToSubmit(date),
                price: Number(price),
                vat: Number(vat),
                total: total,
                comments: comments,
            }
            await axios.post(`/api/expense`, { data: fixApostrophes(data) });
            router.push('/');
        }
    }

    /**
     * Fetch the relevand data from the server (client size fetch)
     */
    const fetchData = async () => {
        const res = await axios.all([
            axios.get(`/api/supplier?cols=name`),
            axios.get(`/api/category?type=expense`),
        ]);
        apis.setters.suppliersList(res[0].data.suppliers.map(supplier => supplier.name));
        apis.setters.categoryList(res[1].data.categories.map(category => category.name));
    }

    /**
     * Re-fetch after a new entry was added to the database
     */
    useEffect(() => {
        if (!firstUpdate.current && !entry)
            fetchData();
        firstUpdate.current = false;
    }, [entry])

    /** Render */
    return (
        <Container maxWidth='md'>
            <PageTitle dividerColor="expense">הוצאה חדשה</PageTitle>
            <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item md={3} xs={6}>
                        <Autocomplete
                            id="autocomplete-expense-supplier"
                            value={supplier}
                            onChange={(evt, newSupplier) => handleChange(newSupplier, "supplier")}
                            onInputChange={() => valid.clear("supplier")}
                            options={[{adder: true, value: "הוסף ספק חדש"}, ...suppliersList]}
                            getOptionLabel={option => option.adder ? option.value : option}
                            classes={{ option: classes.list }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    classes={{ root: classes.root }}
                                    label="ספק"
                                    error={valid.validator.supplier.error}
                                    helperText={valid.validator.supplier.error && valid.validator.supplier.helperText}
                                />)}
                            noOptionsText="לא נמצאו תוצאות"
                        />
                    </Grid>
                    <Grid item md={3} xs={6}>
                        <Autocomplete
                            id="autocomplete-expense-category"
                            value={category}
                            onChange={(evt, newSupplier) => handleChange(newSupplier, "category")}
                            onInputChange={() => valid.clear("category")}
                            options={[{adder: true, value: "הוסף קטגוריה חדש"}, ...categoryList]}
                            getOptionLabel={option => option.adder ? option.value : option}
                            classes={{ option: classes.list }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    classes={{ root: classes.root }}
                                    label="קטגוריה"
                                    error={valid.validator.category.error}
                                    helperText={valid.validator.category.error && valid.validator.category.helperText}
                                />)}
                            noOptionsText="לא נמצאו תוצאות"
                        />
                    </Grid>
                    <Hidden xsDown>
                        <Grid item md={3} xs={false}></Grid>
                    </Hidden>
                    <Grid item md={3} xs={12}>
                        <FormControl classes={{ root: classes.root }}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    label="תאריך"
                                    value={date}
                                    onChange={(evt) => handleChange(evt.toLocaleDateString(), "date")}
                                    maxDate={new Date()}
                                    format="dd/MM/yyyy"
                                    invalidDateMessage="תאריך לא חוקי"
                                    autoOk
                                    variant="inline"
                                />
                            </MuiPickersUtilsProvider>
                        </FormControl>
                    </Grid>
                    <Grid item md={2} xs={7}>
                            <TextValidator
                                fullWidth
                                classes={{ root: classes.root }}
                                className={classes.numberField}
                                label={`סה"כ לפני מע"מ`}
                                value={numberWithCommas(price)}
                                onChange={(evt) => handleChange(evt.target.value.replaceAll(",", ""), "price")}
                                InputProps={{
                                    endAdornment: <InputAdornment>₪</InputAdornment>,
                                  }}
                                validators={['matchRegexp:^-?[0-9]*\.*[0-9]*$', 'required']}
                                errorMessages={['אנא הכנס מספר', 'אנא הכנס מספר']}
                            />
                    </Grid>
                    <Grid item md={2} xs={5}>
                        <TextValidator
                            classes={{ root: classes.root }}
                            fullWidth
                            className={classes.numberField}
                            label={`מע"מ`}
                            value={numberWithCommas(vat)}
                            onChange={(evt) => handleChange(evt.target.value.replaceAll(",", ""), "vat")}
                            InputProps={{
                                endAdornment: <InputAdornment>₪</InputAdornment>,
                                }}
                            validators={['matchRegexp:^-?[0-9]*\.*[0-9]*$', 'minNumber:0']}
                            errorMessages={[
                                'אנא הכנס מספר',
                                'ערך לא חוקי'
                                ]}
                        />
                    </Grid>
                    <Grid item container md={2} xs={12} alignItems='center'>
                        <TextField
                            disabled
                            fullWidth
                            label={`סה"כ`}
                            value={numberWithCommas(total)}
                            InputProps={{
                                endAdornment: <InputAdornment>₪</InputAdornment>,
                                }}
                        />
                    </Grid>
                    <Hidden xsDown>
                        <Grid item md={1} xs={false}></Grid>
                    </Hidden>
                    <Grid item md={5} xs={12}>
                        <TextField
                            classes={{ root: classes.root }}
                            label="אסמכתא"
                            value={reference}
                            onChange={(evt) => handleChange(evt.target.value, "reference")}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            classes={{ root: classes.root }}
                            multiline
                            label="הערות"
                            value={comments}
                            onChange={(evt) => handleChange(evt.target.value, "comments")}
                        />
                    </Grid>
                </Grid>

                <div className={classes.buttonContainer}>
                    <Button type="submit" onClick={valid.validate} variant="contained" color="primary">סיום</Button>
                </div>
            </ValidatorForm>
        </Container>
    )
}

export async function getServerSideProps(ctx) {
    const session = await auth0.getSession(ctx.req);
    const fetched = JSON.stringify(await newExpenseFetcher(session));
    return {
        props: { fetched }
    }
  }