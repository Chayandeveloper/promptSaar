<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('prompts')->orderBy('id', 'desc')->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'admin'      => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
            'icon'        => 'nullable|string|max:50',
            'status'      => 'nullable|in:active,inactive',
        ]);

        Category::create([
            'name'        => $validated['name'],
            'slug'        => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'image'       => $validated['image'] ?? null,
            'icon'        => $validated['icon'] ?? 'sparkles',
            'status'      => $validated['status'] ?? 'active',
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category created!');
    }

    public function update(Request $request, int $id)
    {
        $category  = Category::findOrFail($id);
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
            'icon'        => 'nullable|string|max:50',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $category->update($validated);

        return redirect()->route('admin.categories.index')->with('success', 'Category updated!');
    }

    public function destroy(int $id)
    {
        Category::findOrFail($id)->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted!');
    }
}
