<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Template::query();

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('category', 'like', $search)
                  ->orWhere('description', 'like', $search);
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        $templates = $query->orderBy('order', 'asc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total'       => Template::count(),
            'active'      => Template::where('is_active', true)->count(),
            'total_uses'  => Template::sum('use_count'),
            'total_views' => Template::sum('views_count'),
        ];

        $categories = Template::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category');

        return Inertia::render('Templates/Index', [
            'templates'  => $templates,
            'stats'      => $stats,
            'categories' => $categories,
            'filters'    => $request->only('search', 'category'),
            'admin'      => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'category'      => 'required|string|max:100',
            'thumbnail_url' => 'required|string',
            'video_url'     => 'required|string',
            'capcut_url'    => 'required|string|max:2000',
            'duration'      => 'nullable|string|max:20',
            'is_featured'   => 'nullable|boolean',
            'is_active'     => 'nullable|boolean',
            'order'         => 'nullable|integer',
            'tags'          => 'nullable',
        ]);

        $tags = [];
        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $tags = $validated['tags'];
            } else {
                $tags = array_map('trim', explode(',', $validated['tags']));
            }
        }

        Template::create([
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'category'      => $validated['category'],
            'thumbnail_url' => $validated['thumbnail_url'],
            'video_url'     => $validated['video_url'],
            'capcut_url'    => $validated['capcut_url'],
            'duration'      => $validated['duration'] ?: '0:15',
            'tags'          => $tags,
            'is_featured'   => (bool) ($validated['is_featured'] ?? false),
            'is_active'     => (bool) ($validated['is_active'] ?? true),
            'order'         => (int) ($validated['order'] ?? 0),
        ]);

        return redirect()->route('admin.templates.index')->with('success', 'CapCut Video Template created successfully!');
    }

    public function update(Request $request, int $id)
    {
        $template = Template::findOrFail($id);

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'category'      => 'required|string|max:100',
            'thumbnail_url' => 'required|string',
            'video_url'     => 'required|string',
            'capcut_url'    => 'required|string|max:2000',
            'duration'      => 'nullable|string|max:20',
            'is_featured'   => 'nullable|boolean',
            'is_active'     => 'nullable|boolean',
            'order'         => 'nullable|integer',
            'tags'          => 'nullable',
        ]);

        $tags = [];
        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $tags = $validated['tags'];
            } else {
                $tags = array_map('trim', explode(',', $validated['tags']));
            }
        }

        $template->update([
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'category'      => $validated['category'],
            'thumbnail_url' => $validated['thumbnail_url'],
            'video_url'     => $validated['video_url'],
            'capcut_url'    => $validated['capcut_url'],
            'duration'      => $validated['duration'] ?: '0:15',
            'tags'          => $tags,
            'is_featured'   => (bool) ($validated['is_featured'] ?? false),
            'is_active'     => (bool) ($validated['is_active'] ?? true),
            'order'         => (int) ($validated['order'] ?? 0),
        ]);

        return redirect()->route('admin.templates.index')->with('success', 'Template updated successfully!');
    }

    public function toggle(int $id)
    {
        $template = Template::findOrFail($id);
        $template->is_active = !$template->is_active;
        $template->save();

        return back()->with('success', 'Template status updated!');
    }

    public function destroy(int $id)
    {
        $template = Template::findOrFail($id);
        $template->delete();

        return redirect()->route('admin.templates.index')->with('success', 'Template deleted successfully!');
    }

    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimes:mp4,mov,avi,webm,mkv|max:102400', // max 100MB
        ]);

        $path = $request->file('video')->store('templates/videos', 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }

    public function uploadThumbnail(Request $request)
    {
        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:10240', // max 10MB
        ]);

        $path = $request->file('thumbnail')->store('templates/thumbnails', 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }
}
