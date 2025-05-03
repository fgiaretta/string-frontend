# Material UI v7 Grid Component Migration Guide

## Problem

In Material UI v7, the Grid component API has changed significantly. The responsive breakpoint props (`xs`, `sm`, `md`, etc.) and the `component` prop are no longer directly available on the Grid component.

## Solution

### Before (Material UI v5)

```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Card>...</Card>
  </Grid>
</Grid>
```

### After (Material UI v7)

```jsx
<Grid container spacing={3}>
  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
    <Card>...</Card>
  </Grid>
</Grid>
```

## Key Changes

1. Remove `item` prop - it's no longer needed
2. Replace `xs={12}` with `sx={{ width: { xs: '100%' } }}`
3. Replace `md={6}` with `sx={{ width: { md: '50%' } }}`
4. Remove `component="div"` prop - it's no longer needed

## Common Width Conversions

- `xs={12}` → `sx={{ width: { xs: '100%' } }}`
- `xs={6}` → `sx={{ width: { xs: '50%' } }}`
- `xs={4}` → `sx={{ width: { xs: '33.33%' } }}`
- `xs={3}` → `sx={{ width: { xs: '25%' } }}`
- `xs={2}` → `sx={{ width: { xs: '16.67%' } }}`
- `xs={1}` → `sx={{ width: { xs: '8.33%' } }}`

## Combined Example

### Before

```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={4}>
    <Card>...</Card>
  </Grid>
  <Grid item xs={12} md={8}>
    <Card>...</Card>
  </Grid>
</Grid>
```

### After

```jsx
<Grid container spacing={3}>
  <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
    <Card>...</Card>
  </Grid>
  <Grid sx={{ width: { xs: '100%', md: '66.67%' } }}>
    <Card>...</Card>
  </Grid>
</Grid>
```
