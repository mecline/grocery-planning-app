import React from 'react';
import { Chip, Box, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { textColor, backgroundColor } from '../theme/MealPlannerTheme';

class IngredientChips extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIngredients: props.selectedIngredients || [],
            searchTerm: '',
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedIngredients !== this.props.selectedIngredients) {
            this.setState({ selectedIngredients: this.props.selectedIngredients });
        }
    }

    handleChipClick = (ingredient) => {
        const updatedIngredients = [...this.state.selectedIngredients];
        const index = updatedIngredients.findIndex(
            item => item.ingredientId === ingredient.ingredientId
        );

        if (index !== -1) {
            // Increment quantity if already selected
            updatedIngredients[index] = {
                ...updatedIngredients[index],
                quantity: (updatedIngredients[index].quantity || 1) + 1
            };
            this.setState({ selectedIngredients: updatedIngredients });
            this.props.onIngredientsChange(updatedIngredients);
        } else {
            // Add to selected ingredients
            const newIngredient = {
                ...ingredient,
                quantity: 1
            };
            this.setState({
                selectedIngredients: [...this.state.selectedIngredients, newIngredient]
            });
            this.props.onIngredientsChange([...this.state.selectedIngredients, newIngredient]);
        }
    };

    handleChipDelete = (ingredientId) => {
        const updatedIngredients = this.state.selectedIngredients.filter(
            item => item.ingredientId !== ingredientId
        );
        this.setState({ selectedIngredients: updatedIngredients });
        this.props.onIngredientsChange(updatedIngredients);
    };

    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value.toLowerCase() });
    };

    renderCategories() {
        const { ingredients } = this.props;
        const { selectedIngredients, searchTerm } = this.state;
        
        // Filter ingredients by search term
        const filteredIngredients = ingredients.filter(ingredient => 
            ingredient.ingredientName.toLowerCase().includes(searchTerm)
        );
        
        // Group ingredients by category
        const categorizedIngredients = {};
        filteredIngredients.forEach(ingredient => {
            if (!categorizedIngredients[ingredient.category]) {
                categorizedIngredients[ingredient.category] = [];
            }
            categorizedIngredients[ingredient.category].push(ingredient);
        });

        // Create selectedMap for quick lookup
        const selectedMap = {};
        selectedIngredients.forEach(item => {
            selectedMap[item.ingredientId] = item;
        });

        return Object.entries(categorizedIngredients)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, categoryIngredients]) => (
                <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {category}
                    </Typography>
                    <Box sx={{ display: 'grid', width: 'fit-content', minWidth: '75px', gap: 1 }}>
                        {categoryIngredients.map(ingredient => {
                            const isSelected = selectedMap[ingredient.ingredientId];
                            return (
                                <Chip
                                    key={ingredient.ingredientId}
                                    label={
                                        <span>
                                            {isSelected && isSelected.quantity > 0 && 
                                                <span style={{ marginRight: '4px' }}>
                                                    ({isSelected.quantity})
                                                </span>
                                            }
                                            {ingredient.ingredientName}
                                        </span>
                                    }
                                    onClick={() => this.handleChipClick(ingredient)}
                                    onDelete={isSelected ? () => this.handleChipDelete(ingredient.ingredientId) : undefined}
                                    sx={{
                                        backgroundColor: isSelected ? backgroundColor : '#f1f1f1',
                                        color: isSelected ? textColor : 'rgba(0, 0, 0, 0.87)',
                                        '& .MuiChip-deleteIcon': {
                                            color: isSelected ? textColor : 'rgba(0, 0, 0, 0.26)'
                                        }
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            ));
    }

    render() {
        return (
            <Box sx={{ p: 1 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search ingredients..."
                    value={this.state.searchTerm}
                    onChange={this.handleSearchChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                {this.renderCategories()}
            </Box>
        );
    }
}

export default IngredientChips;