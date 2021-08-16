import React from 'react';
import Button from '@material-ui/core/Button';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    label: {
        textTransform: 'none',
    },
}));

export default function RunButton(props) {
    const { t, i18n } = useTranslation();
    const { disabled, runReport } = props;
    const classes = useStyles();

    var buttonRun = <Button classes={{ label: classes.label }} variant="contained" color="primary" onClick={() => { runReport() }}>
        {t('base.run')}
                </Button>;

    if (disabled) {
        buttonRun = <Button classes={{ label: classes.label }} variant="outlined" disabled>
            {t('base.run')}
                </Button>;
    }
    return buttonRun;
}