import { Button, Card, IconButton, Input, MenuItem, TextField, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import React from 'react';
import { CATEGORIES } from '../data/Categories.js';
import MealPlannerTheme, { StyledSquareButton, textColor } from '../theme/MealPlannerTheme';
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
        const { classes, isMobile = false } = this.props;

        return (
            <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: isMobile ? 1 : 2
            }}>
                <Card sx={{ 
                    p: isMobile ? 2 : 4, 
                    width: isMobile ? '95vw' : '500px', 
                    maxWidth: '100%',
                    maxHeight: isMobile ? '90vh' : '85vh', 
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ color: textColor, fontWeight: 'bold' }}>
                            Add Ingredient
                        </Typography>
                    </Box>
                    
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography variant={isMobile ? "body2" : "body1"}>
                            Add Multiple?
                        </Typography>
                        <IconButton 
                            onClick={() => this.setMultipleAdditions()} 
                            size={isMobile ? "small" : "medium"}
                            sx={{ ml: 1 }}
                        >
                            {this.state.multipleAdditions ? 
                                <CheckBox className={classes.addButton} /> : 
                                <CheckBoxOutlineBlank className={classes.addButton} />
                            }
                        </IconButton>
                    </Box>
                    
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        width: '100%',
                        mb: 2
                    }}>
                        <TextField 
                            variant="outlined" 
                            label="Ingredient Name" 
                            required
                            value={this.state.ingredientName}
                            onInput={e => this.setIngredientName(e.target.value)}
                            fullWidth
                            size={isMobile ? "small" : "medium"}
                        />
                        <TextField
                            select
                            value={this.state.category}
                            variant="outlined"
                            label="Category"
                            onChange={e => this.setCategory(e.target.value)}
                            fullWidth
                            size={isMobile ? "small" : "medium"}
                            input={<Input />}
                        >
                            {CATEGORIES.sort((a, b) => a.name > b.name ? 1 : -1).map((item) => {
                                return <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                            })}
                        </TextField>
                        <TextField 
                            variant="outlined" 
                            label="Notes" 
                            multiline
                            rows={isMobile ? 2 : 3}
                            value={this.state.notes}
                            onInput={e => this.setNotes(e.target.value)}
                            fullWidth
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>
                    
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 'auto',
                        pt: 2,
                        borderTop: '1px solid #eee'
                    }}>
                        <Button 
                            sx={{ mr: 1 }} 
                            onClick={() => this.props.closeCallback()}
                            size={isMobile ? "small" : "medium"}
                        >
                            Back
                        </Button>
                        <StyledSquareButton
                            onClick={() => this.handleAdditionSubmit()}
                            size={isMobile ? "small" : "medium"}
                        >
                            Add
                        </StyledSquareButton>
                    </Box>
                </Card>
            </Box>
        );
    }
}

export default withStyles(styles, { withTheme: true })(IngredientModal);