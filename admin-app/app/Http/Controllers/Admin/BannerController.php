<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Prompt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        $banners = Banner::with(['prompt.category', 'category'])
            ->orderBy('order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        $prompts = Prompt::select('id', 'title', 'cover_image', 'category_id', 'description')
            ->with('category:id,name,slug')
            ->where('is_published', true)
            ->orderBy('id', 'desc')
            ->get();

        $categories = Category::select('id', 'name', 'slug')->orderBy('name')->get();

        return Inertia::render('Banners/Index', [
            'banners'    => $banners,
            'prompts'    => $prompts,
            'categories' => $categories,
            'admin'      => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:500',
            'badge_text'  => 'nullable|string|max:50',
            'image_url'   => 'required|string',
            'cta_text'    => 'nullable|string|max:50',
            'action_type' => 'required|in:prompt,category,url,none',
            'prompt_id'   => 'nullable|exists:prompts,id',
            'category_id' => 'nullable|exists:categories,id',
            'target_url'  => 'nullable|string|max:1000',
            'is_active'   => 'nullable|boolean',
            'order'       => 'nullable|integer',
        ]);

        Banner::create([
            'title'       => $validated['title'],
            'subtitle'    => $validated['subtitle'] ?? null,
            'badge_text'  => $validated['badge_text'] ?: 'FEATURED PROMPT',
            'image_url'   => $validated['image_url'],
            'cta_text'    => $validated['cta_text'] ?: 'View & Unlock',
            'action_type' => $validated['action_type'],
            'prompt_id'   => $validated['action_type'] === 'prompt' ? ($validated['prompt_id'] ?? null) : null,
            'category_id' => $validated['action_type'] === 'category' ? ($validated['category_id'] ?? null) : null,
            'target_url'  => $validated['action_type'] === 'url' ? ($validated['target_url'] ?? null) : null,
            'is_active'   => $validated['is_active'] ?? true,
            'order'       => $validated['order'] ?? 0,
        ]);

        return redirect()->route('admin.banners.index')->with('success', 'Banner created successfully!');
    }

    public function update(Request $request, int $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:500',
            'badge_text'  => 'nullable|string|max:50',
            'image_url'   => 'required|string',
            'cta_text'    => 'nullable|string|max:50',
            'action_type' => 'required|in:prompt,category,url,none',
            'prompt_id'   => 'nullable|exists:prompts,id',
            'category_id' => 'nullable|exists:categories,id',
            'target_url'  => 'nullable|string|max:1000',
            'is_active'   => 'nullable|boolean',
            'order'       => 'nullable|integer',
        ]);

        $banner->update([
            'title'       => $validated['title'],
            'subtitle'    => $validated['subtitle'] ?? null,
            'badge_text'  => $validated['badge_text'] ?: 'FEATURED PROMPT',
            'image_url'   => $validated['image_url'],
            'cta_text'    => $validated['cta_text'] ?: 'View & Unlock',
            'action_type' => $validated['action_type'],
            'prompt_id'   => $validated['action_type'] === 'prompt' ? ($validated['prompt_id'] ?? null) : null,
            'category_id' => $validated['action_type'] === 'category' ? ($validated['category_id'] ?? null) : null,
            'target_url'  => $validated['action_type'] === 'url' ? ($validated['target_url'] ?? null) : null,
            'is_active'   => $validated['is_active'] ?? $banner->is_active,
            'order'       => $validated['order'] ?? $banner->order,
        ]);

        return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully!');
    }

    public function toggle(int $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->is_active = !$banner->is_active;
        $banner->save();

        return back()->with('success', 'Banner status updated!');
    }

    public function destroy(int $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner deleted successfully!');
    }

    public function setFromPrompt(Request $request, int $promptId)
    {
        $prompt = Prompt::with('category')->findOrFail($promptId);

        // Update or create active top banner for this prompt
        $banner = Banner::where('prompt_id', $prompt->id)->first();
        if ($banner) {
            $banner->update([
                'title'       => $prompt->title,
                'subtitle'    => $prompt->description,
                'image_url'   => $prompt->cover_image,
                'badge_text'  => 'FEATURED PROMPT',
                'cta_text'    => 'View & Unlock',
                'action_type' => 'prompt',
                'category_id' => $prompt->category_id,
                'is_active'   => true,
                'order'       => 0,
            ]);
        } else {
            Banner::create([
                'title'       => $prompt->title,
                'subtitle'    => $prompt->description,
                'badge_text'  => 'FEATURED PROMPT',
                'image_url'   => $prompt->cover_image,
                'cta_text'    => 'View & Unlock',
                'action_type' => 'prompt',
                'prompt_id'   => $prompt->id,
                'category_id' => $prompt->category_id,
                'is_active'   => true,
                'order'       => 0,
            ]);
        }

        // Put other banners order + 1
        Banner::where('id', '!=', $banner ? $banner->id : Banner::latest()->first()->id)
            ->increment('order');

        return back()->with('success', "Prompt '{$prompt->title}' is now set as the top banner!");
    }

    public function uploadImage(Request $request)
    {
        $request->validate(['image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120']);
        $path = $request->file('image')->store('banners', 'public');

        return response()->json(['url' => asset('storage/' . $path)]);
    }
}
