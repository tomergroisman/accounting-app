import React, { useState, useRef } from 'react';
import InputAdornment from '@material-ui/core/InputAdornment';
import { TextValidator} from 'react-material-ui-form-validator';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { setReceiptItems } from '../../hooks/receiptItemHooks';
import ItemButtons from './ItemButtons'
import { ccyFormat, numberWithCommas } from '../../helpers/functions';
import useStyles from '../../styles/components/ReceiptStyles';

export default function RowForm(props) {
    const { add, edit, index, item, enableDrag, inEditError } = props;
    const [error, setError] = useState({ active: false, message: 'אנא הזן פירוט' });
    const classes = useStyles(props);
    const [
            desc, price, qty, sum,
            handleChange, validation, clear
        ] = setReceiptItems(item);
    const refs = [useRef(null), useRef(null), useRef(null)];
    const inputRefs = [useRef(null), useRef(null), useRef(null)];

    const handleSubmit = async () => {
        const newItem = {
            desc,
            price: Number(price),
            qty: Number(qty),
            sum,
            edit: false
        };
        if (validation(refs)) {
            if (item) edit(index, newItem)
            else add(newItem)
            setError({ ...error, active: false });
            clear();
            if (enableDrag) enableDrag();
        } else {
            setError({ ...error, active: true });
        }
    }

    /**
     * Handke field bluring
     * Add an item if all fields filled
     * 
     * @param {String} field 
     */
    const handleFocus = (field) => {
        if (field == "price" && price == 0)
            handleChange("", "price")
    }

    /**
     * Handke field bluring
     * Add an item if all fields filled
     * 
     * @param {String} field 
     */
    const handleBlur = (field) => {
        switch (field) {
            case "price": {
                if (!price)
                    handleChange("0", "price");
                break;
            }
            case "qty": {
                if (!qty)
                    handleChange("1", "qty")
                break;
            }
        }

        setTimeout(() => {
            if (!inputRefs.find(ref => ref.current == document.activeElement) && desc) {
                handleSubmit();
            }
        }, 100);
    }

    /** Render */
    return (
        <TableRow className={item ? (inEditError ? classes.editItemError: classes.editItemGlow) : classes.newItem}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
                <TextValidator
                    ref={refs[0]}
                    inputRef={inputRefs[0]}
                    fullWidth
                    label="פירוט"
                    value={desc}
                    onChange={(evt) => handleChange(evt.target.value, "desc")}
                    error={error.active && !desc.length}
                    helperText={error.active && !desc.length ? error.message : ""}
                    validators={['descExists']}
                    errorMessages={['פריט כבר קיים']}
                    onFocus={() => handleFocus("desc")}
                    onBlur={handleBlur}
                />
            </TableCell>
            <TableCell>
                <TextValidator
                    ref={refs[1]}
                    inputRef={inputRefs[1]}
                    className={classes.numberField}
                    label="מחיר ליחידה"
                    value={numberWithCommas(price)}
                    onChange={(evt) => handleChange(evt.target.value.replaceAll(",", ""), "price")}
                    InputProps={{
                        endAdornment: <InputAdornment>₪</InputAdornment>,
                        }}
                    validators={['matchRegexp:^[0-9,]+[\.]?[0-9,]*$|^-[0-9,]+[\.]?[0-9,]*$']}
                    errorMessages={['ערך לא חוקי']}
                    onFocus={ () => handleFocus("price") }
                    onBlur={ () => handleBlur("price") }
                />
            </TableCell>
            <TableCell>
                <TextValidator
                    ref={refs[2]}
                    inputRef={inputRefs[2]}
                    className={classes.numberField}
                    label="כמות"
                    value={qty}
                    onChange={(evt) => handleChange(evt.target.value, "qty")}
                    validators={['matchRegexp:^[0-9]+[\.]?[0-9]*$|^-[0-9]+[\.]?[0-9]*$', 'minNumber:1']}
                    errorMessages={[
                        'ערך לא חוקי',
                        'ערך לא חוקי'
                        ]}
                    onFocus={() => handleFocus("qty")}
                    onBlur={ () => handleBlur("qty") }
                />
            </TableCell>
            <TableCell className={classes.sum} align="right">
                {numberWithCommas(ccyFormat(sum))}
            </TableCell>
            <TableCell><ItemButtons handleClick={handleSubmit} mode={item ? 'edit' : 'new'} /></TableCell>
        </TableRow>
    )
}
