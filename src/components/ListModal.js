import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
    Chip,
    Divider,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import React from 'react';
import { auth } from '../firebase/firebase.js';
import { StyledSquareButton, backgroundColor, textColor } from '../theme/MealPlannerTheme';

class ListModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth.currentUser,
            searchTerm: '',
            selectedMeals: this.props.selectedMeals ? [...this.props.selectedMeals] : []
        };
    }

    handleSearch = (event) => {
        this.setState({ searchTerm: event.target.value.toLowerCase() });
    };

    handleChipClick = (meal) => {
        const mealId = meal.mealId;
        let newSelectedMeals = [...this.state.selectedMeals];
        
        if (newSelectedMeals.includes(mealId)) {
            return;
        } else {
            newSelectedMeals.push(mealId);
        }

        this.setState({ selectedMeals: newSelectedMeals });
    };

    handleChipDelete = (mealId) => {
        let newSelectedMeals = this.state.selectedMeals.filter(id => id !== mealId);
        this.setState({ selectedMeals: newSelectedMeals });
    };

    render() {
        const { db } = this.props;
        const { searchTerm, selectedMeals } = this.state;

        // Get all meals from database
        let mealsDbRef = db.ref(`users/${this.state.user.uid}/meals`);
        let allMeals = [];

        mealsDbRef.on('child_added', function(snapshot) {
            allMeals.push({
                mealId: snapshot.key,
                mealTitle: snapshot.val().mealTitle,
                ingredients: snapshot.val().ingredients
            });
        });

        // Filter meals based on search term
        const filteredMeals = allMeals.filter(meal => 
            meal.mealTitle.toLowerCase().includes(searchTerm)
        );

        // Create a lookup for meal titles by ID
        const mealTitlesById = {};
        allMeals.forEach(meal => {
            mealTitlesById[meal.mealId] = meal.mealTitle;
        });

        return (
            <Box sx={{ 
                width: '600px', 
                p: 4, 
                display: 'flex', 
                flexDirection: 'column' 
            }}>
                <Typography variant="h5" sx={{ mb: 3, color: textColor }}>
                    Select Meals for Shopping List
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                    <Paper 
                        elevation={1} 
                        sx={{ 
                            p: 2, 
                            minHeight: '50px',
                            backgroundColor: '#f9f9f9', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1 
                        }}
                    >
                        {selectedMeals.length > 0 ? (
                            // Display selected meals
                            [...new Set(selectedMeals)].map(mealId => (
                                mealTitlesById[mealId] && (
                                    <Chip
                                        key={mealId}
                                        label={mealTitlesById[mealId]}
                                        onDelete={() => this.handleChipDelete(mealId)}
                                        sx={{
                                            backgroundColor: backgroundColor,
                                            color: textColor,
                                            '& .MuiChip-deleteIcon': {
                                                color: textColor
                                            }
                                        }}
                                    />
                                )
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                No meals selected. Click on a meal below to add it to your list.
                            </Typography>
                        )}
                    </Paper>
                </Box>

                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: textColor }}>
                        Available Meals:
                    </Typography>
                    
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search meals..."
                        value={searchTerm}
                        onChange={this.handleSearch}
                        sx={{ width: '250px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                
                <Box 
                    sx={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto', 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        p: 1,
                        mb: 3
                    }}
                >
                    {filteredMeals.length > 0 ? (
                        filteredMeals.map(meal => {
                            const isSelected = selectedMeals.includes(meal.mealId);
                            return (
                                <Chip
                                    key={meal.mealId}
                                    label={meal.mealTitle}
                                    onClick={() => this.handleChipClick(meal)}
                                    sx={{
                                        backgroundColor: isSelected ? backgroundColor : '#f1f1f1',
                                        color: isSelected ? textColor : 'rgba(0, 0, 0, 0.87)',
                                        '&:hover': {
                                            backgroundColor: isSelected ? backgroundColor : '#e0e0e0',
                                        }
                                    }}
                                />
                            );
                        })
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', p: 1 }}>
                            No meals found matching "{searchTerm}".
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                        onClick={() => this.props.closeCallback()} 
                        sx={{ mr: 1 }}
                    >
                        Cancel
                    </Button>
                    <StyledSquareButton
                        onClick={() => this.props.confirmCallback(selectedMeals)}
                    >
                        Save
                    </StyledSquareButton>
                </Box>
            </Box>
        );
    }
}

export default ListModal;