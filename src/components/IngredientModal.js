import { Button, Card, IconButton, Input, MenuItem, TextField } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import React from 'react';
import { CATEGORIES } from '../data/Categories.js';
import MealPlannerTheme, { StyledSquareButton } from '../theme/MealPlannerTheme';
import { withStyles } from '@mui/styles';

const styles = theme => ({
    ...MealPlannerTheme(theme)
});

class IngredientModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ingredientName: props.ingredientName ? props.ingredientName : '',
            category: props.category ? props.category : 'Other',
            notes: props.notes ? props.notes : '',
            multipleAdditions: false
        };
    }

    setIngredientName = (ingredientName) => {
        this.setState({ ingredientName: ingredientName });
    }

    setCategory = (category) => {
        this.setState({ category: category });
    }

    setNotes = (notes) => {
        this.setState({ notes: notes });
    }

    setMultipleAdditions = () => {
        this.setState({ multipleAdditions: !this.state.multipleAdditions })
    }

    handleAdditionSubmit = () => {
        this.state.multipleAdditions && this.setState({ ingredientName: '', category: 'Other', notes: '' });
        this.props.confirmCallback(this.state.ingredientName, this.state.category,
            this.state.notes, this.props.ingredientId, this.state.multipleAdditions);
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Card style={{ padding: '20px', minWidth: '80vh', minHeight: '75vh' }}>
                    Add Multiple?
                    <IconButton onClick={() => this.setMultipleAdditions()} size="large">
                        {this.state.multipleAdditions ? <CheckBox className={classes.addButton} /> : <CheckBoxOutlineBlank className={classes.addButton} />}
                    </IconButton>
                    <div style={{ display: 'inline-grid' }}>
                        <TextField style={{ marginBottom: '20px' }} variant="outlined" label="Ingredient Name" required
                            value={this.state.ingredientName}
                            onInput={e => this.setIngredientName(e.target.value)}
                        />
                        <TextField
                            style={{ marginBottom: '20px' }}
                            select
                            value={this.state.category}
                            variant="outlined"
                            label="Category"
                            onChange={e => this.setCategory(e.target.value)}
                            input={<Input />}>
                            {CATEGORIES.sort((a, b) => a.name > b.name ? 1 : -1).map((item) => {
                                return <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                            })}
                        </TextField>
                        <TextField style={{ marginBottom: '20px' }} variant="outlined" label="Notes" multiline
                            value={this.state.notes}
                            onInput={e => this.setNotes(e.target.value)}
                        />
                        <div style={{
                            position: 'absolute', right: 0, bottom: 0, margin: '15px'
                        }}>
                            <Button style={{ marginRight: '5px' }} onClick={() => this.props.closeCallback()}>Back</Button>
                            <StyledSquareButton
                                onClick={() => this.handleAdditionSubmit()}>Add</StyledSquareButton>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}


export default withStyles(styles, { withTheme: true })(IngredientModal);